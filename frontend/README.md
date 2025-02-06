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

3. Create an environment configuration file `.env` from the existing example configuration in the root directory:

    ```bash
    cp .env.example .env
    ```

4. Log in to your [Firebase account](https://console.firebase.google.com), hit the "Add a project" button and set up a project name and a server location
5. Now you can add an app by clicking the "Web" button, choose a nickname and click "Next"
6. Copy *API key* and *project ID* into your `.env` file
7. Go back to your Firebase console, and click *Create Database* under Develop > Database. Choose *Start in production mode* and paste the security rules that you can copy frome the [firestore.rules](./firestore.rules) file.
8. Create the first user in the Firebase console under Build > Authentification > Add user. After that you'll see the User UID in the table. Copy that UID, navigate to Build > Firestore Database > + Start collection. Input *users* as Collection ID and click Next. Insert the copied UID as Document ID and add the following fields to the document:
    - `email` = string | *your email address*
    - `name` = string | *your name*

9. To give necessary permisstions, click + Start collection again. Input *permissions* as Collection ID and click Next. Insert the copied UID as Document ID and add the following field to the document:
    - `role` = string | `admin`

10. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:5173` ...

    ```bash
    npm run dev
    ```

11. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    npm run build
    ```

12. (optional) You can import demo content if you don't like to start from scratch. First download the [demo data file](./demo.import.json) from the repository. Sign in to SongDrive with your admin user, go to Settings > Import, select the downloaded demo file and import it. You can now have a look at 8 public domain songs, one demo setlist, several song tags, English and German languages and an additional test user.
