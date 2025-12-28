export interface OsInfo {
    platform: string;
    arch: string;
    release: string;
}

export interface UserInfo {
    username: string;
    email?: string;
    osInfo: OsInfo;
}

export interface GenerateOptions {
    projectType: string;
    projectFiles: string[];
    projectDir: string;
    userInfo: UserInfo;
    repoUrl: string | null;
    options: {
        includeSetup: boolean;
        includeContributionGuideLine: boolean;
    };
    existingReadme?: string;
    templateUrl?: string;
}
