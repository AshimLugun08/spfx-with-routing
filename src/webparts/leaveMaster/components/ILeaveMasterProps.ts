import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ILeaveMasterProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
   // Add context here
}
