# ![SongDrive Logo Title](https://github.com/devmount/SongDrive/assets/5441654/77b68e2d-a877-4855-bece-c067f2219e71) &nbsp; frontend

This directory contains all frontend functionality of SongDrive.

## Frontend build instructions

1. Get all files from repository

    ```bash
    git clone https://github.com/devmount/SongDrive
    ```

2. Install all dependencies

    ```bash
    cd SongDrive
    npm install
    ```

3. Set up the backend, which provides authentication and data storage via Amberbase — see the [backend docs](../backend/README.md) for setup instructions

4. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:5173` ...

    ```bash
    npm run dev
    ```

5. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    npm run build
    ```

6. (optional) You can import demo content if you don't like to start from scratch. First download the [demo data file](./demo.import.json) from the repository. Sign in to SongDrive with your admin user, go to Settings > Import, select the downloaded demo file and import it. You can now have a look at 8 public domain songs, one demo setlist, several song tags, English and German languages and an additional test user.
