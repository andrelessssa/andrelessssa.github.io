import { Task } from '../types';

// Types for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const APP_FOLDER_FILE_NAME = 'andre_lessa_tasks_db.json';

// Local storage keys for credentials
const CLIENT_ID_KEY = 'taskflow_gdrive_client_id';
const API_KEY_KEY = 'taskflow_gdrive_api_key';

export interface DriveConfig {
  clientId: string;
  apiKey: string;
}

export const getStoredDriveConfig = (): DriveConfig | null => {
  const clientId = localStorage.getItem(CLIENT_ID_KEY);
  const apiKey = localStorage.getItem(API_KEY_KEY);
  if (clientId && apiKey) return { clientId, apiKey };
  return null;
};

export const saveDriveConfig = (config: DriveConfig) => {
  localStorage.setItem(CLIENT_ID_KEY, config.clientId);
  localStorage.setItem(API_KEY_KEY, config.apiKey);
};

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleDrive = async (config: DriveConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    const initializeGapiClient = async () => {
      await window.gapi.client.init({
        apiKey: config.apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
      gapiInited = true;
      if (gisInited) resolve();
    };

    if (window.gapi) {
        window.gapi.load('client', initializeGapiClient);
    } else {
        reject("Google API script not loaded");
    }

    if (window.google) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: config.clientId,
            scope: SCOPES,
            callback: '', // defined later
        });
        gisInited = true;
        if (gapiInited) resolve();
    } else {
        reject("Google Identity script not loaded");
    }
  });
};

export const handleAuthClick = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const handleSignOut = () => {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
  }
};

// Find the file ID if it exists
const findFile = async (): Promise<string | null> => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `name = '${APP_FOLDER_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
    });
    const files = response.result.files;
    if (files && files.length > 0) {
      return files[0].id;
    }
    return null;
  } catch (err) {
    console.error("Error finding file", err);
    throw err;
  }
};

// Upload tasks (Create or Update)
export const uploadToDrive = async (tasks: Task[]): Promise<void> => {
  const fileContent = JSON.stringify(tasks, null, 2);
  const fileId = await findFile();
  
  const metadata = {
    name: APP_FOLDER_FILE_NAME,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const accessToken = window.gapi.client.getToken().access_token;

  try {
    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (fileId) {
      // Update existing file
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    await fetch(url, {
      method: method,
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });
  } catch (err) {
    console.error("Upload error", err);
    throw err;
  }
};

// Download tasks
export const downloadFromDrive = async (): Promise<Task[] | null> => {
  const fileId = await findFile();
  if (!fileId) return null;

  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    // The response.result (or body) is the JSON content
    return response.result as Task[];
  } catch (err) {
    console.error("Download error", err);
    throw err;
  }
};