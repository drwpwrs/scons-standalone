declare module 'scons-standalone' {
    /**
     * Extracts and executes the SCons executable for the current platform.
     * @param args - Command-line arguments to pass to SCons.
     */
    function scons(args: string[]): void;

    export = scons;
}

