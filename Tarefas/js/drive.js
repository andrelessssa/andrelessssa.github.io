// Google Drive Service

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const APP_FOLDER_FILE_NAME = 'andre_lessa_tasks_db.json';
const CLIENT_ID_KEY = 'taskflow_gdrive_client_id';
const API_KEY_KEY = 'taskflow_gdrive_api_key';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

export const driveService = {
    isConnected: false,

    getConfig() {
        const clientId = localStorage.getItem(CLIENT_ID_KEY);
        const apiKey = localStorage.getItem(API_KEY_KEY);
        return (clientId && apiKey) ? { clientId, apiKey } : null;
    },

    saveConfig(clientId, apiKey) {
        localStorage.setItem(CLIENT_ID_KEY, clientId);
        localStorage.setItem(API_KEY_KEY, apiKey);
    },

    async init() {
        const config = this.getConfig();
        if (!config) return false;

        return new Promise((resolve, reject) => {
            const checkScripts = setInterval(() => {
                if (window.gapi && window.google) {
                    clearInterval(checkScripts);
                    this.initializeGapiClient(config).then(() => {
                        this.isConnected = true; // Assumimos conectado se inicializou ok e tem token
                        resolve(true);
                    }).catch(reject);
                }
            }, 500);
        });
    },

    async initializeGapiClient(config) {
        await window.gapi.client.init({
            apiKey: config.apiKey,
            discoveryDocs: [DISCOVERY_DOC],
        });
        
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: config.clientId,
            scope: SCOPES,
            callback: '', // Callback dinâmico no auth
        });
    },

    async connect() {
        if (!tokenClient) await this.init();
        
        return new Promise((resolve, reject) => {
            tokenClient.callback = async (resp) => {
                if (resp.error) reject(resp);
                this.isConnected = true;
                resolve();
            };
            tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    },

    disconnect() {
        const token = window.gapi.client.getToken();
        if (token !== null) {
            window.google.accounts.oauth2.revoke(token.access_token);
            window.gapi.client.setToken('');
            this.isConnected = false;
        }
    },

    async findFile() {
        try {
            const response = await window.gapi.client.drive.files.list({
                q: `name = '${APP_FOLDER_FILE_NAME}' and trashed = false`,
                fields: 'files(id, name)',
            });
            const files = response.result.files;
            return (files && files.length > 0) ? files[0].id : null;
        } catch (err) {
            console.error("Erro ao buscar arquivo", err);
            throw err;
        }
    },

    async upload(tasks) {
        const fileContent = JSON.stringify(tasks, null, 2);
        const fileId = await this.findFile();
        
        const metadata = {
            name: APP_FOLDER_FILE_NAME,
            mimeType: 'application/json',
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        const accessToken = window.gapi.client.getToken().access_token;
        let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        let method = 'POST';

        if (fileId) {
            url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
            method = 'PATCH';
        }

        await fetch(url, {
            method: method,
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form,
        });
    },

    async download() {
        const fileId = await this.findFile();
        if (!fileId) return null;

        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        return response.result;
    }
};