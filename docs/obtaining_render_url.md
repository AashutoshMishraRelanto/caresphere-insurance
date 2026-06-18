# Obtaining the Public Render URL

Once your Web Service is successfully deployed to Render, you need to locate the public URL. This URL serves as the **Base URL** for all API requests (and will be placed into Salesforce Named Credentials).

## Step-by-Step Instructions

1. **Log into your Render Dashboard**
   Navigate to [dashboard.render.com](https://dashboard.render.com/) and sign in with your GitHub account.

2. **Select the Web Service**
   On your main dashboard, look under the **Web Services** list. Click on the project name (e.g., `caresphere-insurance`).

3. **Locate the URL**
   - Look near the top-left of the service page, directly below the service name and the GitHub branch (`main`).
   - You will see a clickable hyperlink formatted like:
     `https://caresphere-insurance.onrender.com`
   - *Note: If the name was taken, Render might have appended random characters, e.g., `https://caresphere-insurance-a1b2.onrender.com`*

4. **Copy the URL**
   Right-click the link and select **Copy Link Address**, or simply highlight it and copy it.

## Testing the URL

To verify that the URL is live and the API is correctly running:

1. Open a new tab in your web browser.
2. Paste the URL you just copied, and append `/health` to the very end of it.
   - Example: `https://caresphere-insurance.onrender.com/health`
3. Press Enter.
4. If successful, you will see a simple white screen with the following JSON text:
   ```json
   {
     "status": "UP"
   }
   ```

## Integration Next Steps
Once you have this URL and have verified it using the `/health` endpoint, refer to the `docs/salesforce_integration.md` guide to securely configure Salesforce to talk to this endpoint using Named Credentials and Apex Callouts.
