import { MinimalCSSThemeInfo } from "./ThemeQueryTypes";

export interface TaskQueryResponse {
  id: string;
  name: string;
  status: string;
  completed: Date;
  started: Date;
  success: boolean;
}

export interface ZipSubmitRequest {
  blob: string;
  description: string;
  privateSubmission: boolean;
  imageBlobs: string[];
  target?: string;
}

// There's obviously way more to this dto, but this is all we need
export interface SubmissionDto {
  newTheme: MinimalCSSThemeInfo;
}

export interface SubmissionQueryResponse {
  total: number;
  items: SubmissionDto[];
}
