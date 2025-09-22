#!/usr/bin/env node
/**
 * NodeRex Project Creator
 * Creates new NodeRex projects with basic structure
 */
declare class ProjectCreator {
    private projectName;
    private projectPath;
    /**
     * Create a new NodeRex project
     */
    createProject(projectName: string, options: any): Promise<void>;
    /**
     * Create project directory
     */
    private createProjectDirectory;
    /**
     * Create package.json for the new project
     */
    private createPackageJson;
    /**
     * Create TypeScript configuration
     */
    private createTypeScriptConfig;
    /**
     * Create environment files
     */
    private createEnvFiles;
    /**
     * Create source directory structure
     */
    private createSourceStructure;
    /**
     * Create basic project files
     */
    private createBasicFiles;
    /**
     * Install dependencies
     */
    private installDependencies;
    /**
     * Logging helpers
     */
    private success;
    private error;
    private info;
    private warning;
}
export default ProjectCreator;
//# sourceMappingURL=create-project.d.ts.map