# ![SongDrive Logo Title](https://github.com/devmount/SongDrive/assets/5441654/77b68e2d-a877-4855-bece-c067f2219e71) :: Frontend

This directory contains all frontend functionality of SongDrive. It's build with the [Amberbase](https://github.com/amberbase/amberbase) client and Tailwind.css.

## Frontend build instructions

1. Get all files from repository

    ```bash
    git clone https://github.com/devmount/SongDrive
    ```

2. Install all dependencies

    ```bash
    cd SongDrive/frontend
    npm install
    ```

3. Set up the backend, which provides authentication and data storage via [Amberbase](https://github.com/amberbase/amberbase) — see the [backend docs](../backend/README.md) for setup instructions.

4. Now your app is ready to be launched. Create an optimized production build with minification. All build files can be found in the `backend/dist` directory.

    ```bash
    npm run build
    ```

5. You can now access the app under <http://localhost:3333>

6. (optional) An import of demo content with public domain songs is planned.
