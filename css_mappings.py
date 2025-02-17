import os, asyncio, aiohttp, json, time
from css_utils import Log, get_theme_path, get_steam_version
from css_settings import setting_beta_mappings
from css_browserhook import ON_WEBSOCKET_CONNECT
import traceback

STARTED_FETCHING_TRANSLATIONS = False
SUCCESSFUL_FETCH_THIS_RUN = False
CLASS_MAPPINGS = {}

class Module:
    def __init__(self, id : str, data : dict, root):
        self.id = id
        self.ids = data["ids"]
        self.name = data["name"] if data["name"] else f"_{id}"
        self.mappings = data["classname_mappings"]
        self.ignore_webpack_keys = data["ignore_webpack_keys"]
        self.root = root
        self.current_version_id = None
        self.failed_to_match = 0

        version = root.get_closest_from_steam_version_dict(self.ids)

        if version:
            self.current_version_id = version[1]

    def to_dict(self) -> dict:
        return {
            "name": self.name, 
            "ignore": self.ignore_webpack_keys
        }
    
    def generate_mappings(self) -> dict:
        final_data = {}

        def add_to_final_data(key, value):
            if (key in final_data and value != final_data[key]):
                Log(f"Warning: Mapping with key {key} has 2 different values: '{final_data[key]}' and '{value}'. The latter will be used.")

            final_data[key] = value

        for (webpack_name, class_mappings) in self.mappings.items():
            closest = self.root.get_closest_from_steam_version_dict(class_mappings)

            if not closest:
                #Log(f"Warning: Mapping with webpack name [{self.id}]{webpack_name} have no relevant version mapped. Using latest.")
                self.failed_to_match += 1
                closest = (0, list(class_mappings.values())[-1])

            value = closest[1]

            for css_class in class_mappings.values():
                if value == css_class:
                    continue
                
                add_to_final_data(css_class, value)
        
            add_to_final_data(f"{self.name}_{webpack_name}", value)
            add_to_final_data(f"_{self.id}_{webpack_name}", value)
        
        return final_data

class Mappings:
    def __init__(self):
        self.path = os.path.join(get_theme_path(), "css_translations.json")
        self.use_beta_mappings = setting_beta_mappings()
        self.versions = {}
        self.same_branch_versions = []
        self.target_steam_version = None
        self.local_version = get_steam_version()
        self.target_version = None
        self.modules : list[Module] = []
        self.mappings = {}
        self.timestamp = None
    
    def load(self) -> bool:
        timer = time.time()

        try:
            with open(self.path, 'r', encoding="utf-8") as fp:
                self.data = json.load(fp)
        except Exception as e:
            Log(f"Error while loading translations: {str(e)}.")
            return False 
        
        if "generated" in self.data:
            self.timestamp = self.data["generated"]
        try:
            if 'versions' not in self.data or not self.__load_steam_versions(self.data['versions']):
                Log(f"Cannot find suitable version for translation. Local steam version: {self.local_version}. Available versions: {self.same_branch_versions}.")
                return False

            if not self.__load_modules(self.data["module_mappings"]):
                Log("Failed to parse modules.")
                return False
            
        except Exception as e:
            Log(traceback.format_exc())
            Log(f"Failed to load translations: {str(e)}")
            return False

        Log(f"Loaded {len(self.mappings)} css translations from local file in {time.time() - timer:.1f}s. Failed to map {sum(x.failed_to_match for x in self.modules)} translations.")
        return True
    
    def generate_webpack_id_name_list(self) -> dict:
        data = {}

        for x in self.modules:
            if x.current_version_id != None:
                data[x.current_version_id] = x.to_dict()

        return data

    def __load_modules(self, module_mappings : dict[str, dict]) -> bool:
        self.mappings = {}

        for (module_id, module_data) in module_mappings.items():
            module = Module(module_id, module_data, self)
            self.modules.append(module)

            mappings = module.generate_mappings()

            for (class_name, new_class_name) in mappings.items():
                if (class_name in self.mappings and new_class_name != self.mappings[class_name]):
                    Log(f"Warning: Mapping with key {class_name} has 2 different values from 2 different modules: '{self.mappings[class_name]}' and '{new_class_name}'. The latter will be used.")

                self.mappings[class_name] = new_class_name
        
        return True

    def __load_steam_versions(self, versions : dict[str, str]) -> bool:
        if versions is None:
            return False
        
        target_branch = "beta" if self.use_beta_mappings else "stable"
        self.versions = versions
        self.same_branch_versions = [x for x in versions if target_branch in self.versions[x]]

        self.target_version = self.local_version if self.local_version else "99999999999999"
        result = self.get_closest_from_steam_version_dict(self.versions)

        if not result:
            return False

        self.target_version = result[0]
        Log(f"Using steam version {self.target_version} for translations. Available versions for the {target_branch} branch: {self.same_branch_versions}.")
        return True

    def get_closest_from_steam_version_dict(self, dict : dict[str, None], use_same_branch_search : bool = True) -> tuple[str, None]|None:
        if self.target_version in dict:
            return (self.target_version, dict[self.target_version])

        mapping_sorted = sorted(list(dict.items()), key=lambda x: int(x[0]), reverse=True)
        for (key, value) in mapping_sorted:
            if use_same_branch_search and key not in self.same_branch_versions:
                continue

            if int(key) < int(self.target_version):
                return (key, value)

        return None

__local_mappings : Mappings = None

def get_mappings_timestamp() -> str|None:
    global __local_mappings

    if not __local_mappings:
        return None

    return __local_mappings.timestamp

def generate_webpack_id_name_list() -> dict:
    global __local_mappings

    if not __local_mappings:
        return {}

    return __local_mappings.generate_webpack_id_name_list()

def load_global_translations():
    global __local_mappings

    __local_mappings = Mappings()

    if not __local_mappings.load():
        Log("Failed to load translations.")
        return

    CLASS_MAPPINGS.clear()

    try:
        for (k, v) in __local_mappings.mappings.items():
            CLASS_MAPPINGS[k] = v
    except Exception as e:
        Log(f"Error while loading global translations: {str(e)}")

async def __fetch_class_mappings(css_translations_path : str, loader):
    global SUCCESSFUL_FETCH_THIS_RUN

    if SUCCESSFUL_FETCH_THIS_RUN:
        return
    
    css_translations_url = "https://api.deckthemes.com/mappings.json"
    Log(f"Fetching CSS mappings from {css_translations_url}")

    try:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False, use_dns_cache=False), timeout=aiohttp.ClientTimeout(total=30)) as session:
            async with session.get(css_translations_url) as response:
                if response.status == 200:
                    text = await response.text()
                    
                    if len(text.strip()) <= 0:
                        raise Exception("Empty response")

                    with open(css_translations_path, "w", encoding="utf-8") as fp:
                        fp.write(text)

                    SUCCESSFUL_FETCH_THIS_RUN = True
                    Log(f"Fetched css translations from server")
                    load_global_translations()
                    asyncio.get_running_loop().create_task(loader.reset(silent=True))

    except Exception as ex:
        Log(f"Failed to fetch css translations from server [{type(ex).__name__}]: {str(ex)}")
        
async def __every(__seconds: float, func, *args, **kwargs):
    global SUCCESSFUL_FETCH_THIS_RUN

    await ON_WEBSOCKET_CONNECT.wait()

    while not SUCCESSFUL_FETCH_THIS_RUN:
        await func(*args, **kwargs)
        await asyncio.sleep(__seconds)

async def force_fetch_translations(loader):
    global SUCCESSFUL_FETCH_THIS_RUN
    
    SUCCESSFUL_FETCH_THIS_RUN = False
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    await __fetch_class_mappings(css_translations_path, loader)

def start_fetch_translations(loader):
    css_translations_path = os.path.join(get_theme_path(), "css_translations.json")
    asyncio.get_event_loop().create_task(__every(60, __fetch_class_mappings, css_translations_path, loader))