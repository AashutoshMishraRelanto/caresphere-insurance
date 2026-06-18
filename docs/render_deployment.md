# Render Deployment Guide

This guide outlines how to deploy the standalone Insurance Gateway API to **Render**, connecting it to a **MongoDB Atlas** cloud database.

## 1. MongoDB Atlas Setup
Before deploying the API, you need a public database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Build a new Cluster (the free `M0 Sandbox` is perfect).
3. Under **Database Access**, create a new database user (e.g., `admin`). Note the password.
4. Under **Network Access**, add the IP address `0.0.0.0/0` (Allow access from anywhere, so Render can connect).
5. Click **Connect** on your cluster, choose **Connect your application**, and copy the connection string.
   - It will look like: `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with the password you created.
   - Add a database name before the `?` (e.g., `...mongodb.net/insurance_db?...`).

## 2. GitHub Repository
Render deploys directly from a Git repository.

1. Open your terminal in the `insurance-gateway` folder.
2. Initialize and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Insurance Gateway"
   ```
3. Create a new public or private repository on GitHub.
4. Push your local code to the GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## 3. Render Web Service Deployment
We use the Infrastructure-as-Code `render.yaml` file to automate this setup, but you can also do it via the dashboard.

### Option A: Blueprint (render.yaml)
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New** > **Blueprint**.
3. Connect your GitHub account and select your `insurance-gateway` repository.
4. Render will read the `render.yaml` file.
5. It will ask you to provide the value for `MONGO_URI`. Paste your MongoDB Atlas connection string here.
6. Click **Apply**.

### Option B: Manual Web Service Setup
1. In the Render Dashboard, click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the following:
   - **Name:** `caresphere-insurance`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Expand **Environment Variables** and add:
   - `MONGO_URI`: (Your Atlas connection string)
   - `JWT_SECRET`: (A long, random string)
5. Click **Create Web Service**.

## 4. Obtaining the Actual Generated URL
After your deployment finishes, Render automatically assigns a publicly accessible URL to your Web Service. This is the Base URL you will use in Salesforce.

**How to find it:**
1. Open your Render Dashboard and click on your newly deployed Web Service (`caresphere-insurance`).
2. Look at the top-left area of the screen, directly beneath the name of your service and your GitHub repository branch.
3. You will see a clickable link that looks similar to:
   `https://caresphere-insurance-xxxxx.onrender.com`
4. This is your production Base URL. You can verify it by appending `/health` to the end of the URL and opening it in your browser (it should return `{"status": "UP"}`).

## 5. Verification and Seeding
1. Wait for the deployment to finish and show **Live**.
2. To seed the database with 1,111+ records, you must run the seed script.
   - **For Paid Render Tiers:** Go to the **Shell** tab on Render and run `npm run seed`.
   - **For Free Render Tiers:** Because Render disables the web shell on Free tiers, you can run the seed script locally from your computer by putting the `MONGO_URI` into your `.env` file and running `npm run seed` locally.
   - Wait for it to report `Successfully seeded ... policies.`
