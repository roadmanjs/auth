import {DirArg, buildDirs, createClientPackageJson} from '@roadmanjs/utils';

// Automatically run this
(async () => {
    const args: DirArg[] = [
        {cmd: 'rm', dir: 'dist-client'},
        {cmd: 'mkdir', dir: 'dist-client'},
        {cmd: 'cp', dir: 'dist/client/gql', newDir: 'dist-client/gql'},
    ];

    buildDirs(args);

    await createClientPackageJson({
        name: '@roadmanjs/auth-client',
        description: 'GraphQL client gql for @roadmanjs/auth',
    });
})();
