// Module d'authentification pour le bot

const axios = require('axios');

const fs = require('fs');

const path = require('path');

const os = require('os');

const { v4: uuidv4 } = require('uuid');

// URL de votre serveur d'authentification Vercel

const AUTH_SERVER = 'https://botaccess.vercel.app';

// Informations d'identification du bot

const BOT_ID = 'levantermax'; // ID unique pour votre application

class AuthManager {

  constructor() {

    this.configFile = path.join(__dirname, 'auth-config.json');

    this.config = this.loadConfig();

    this.isAuthenticated = false;

  }

  loadConfig() {

    try {

      if (fs.existsSync(this.configFile)) {

        const rawData = fs.readFileSync(this.configFile, 'utf8');

        return JSON.parse(rawData);

      }

    } catch (err) {

      console.error('Erreur lors du chargement de la configuration:', err);

    }

    // Configuration par défaut si le fichier n'existe pas

    return {

      instanceId: null,

      registeredAt: null,

      lastValidatedAt: null,

      status: 'new'

    };

  }

  saveConfig() {

    try {

      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));

    } catch (err) {

      console.error('Erreur lors de la sauvegarde de la configuration:', err);

    }

  }

  getDeviceInfo() {

    return {

      hostname: os.hostname(),

      platform: os.platform(),

      release: os.release(),

      totalMemory: os.totalmem(),

      uptime: os.uptime()

    };

  }

  async register(phoneNumber) {

    try {

      // Si déjà enregistré, ne pas réenregistrer

      if (this.config.instanceId) {

        return {

          success: true,

          message: 'Déjà enregistré',

          instanceId: this.config.instanceId

        };

      }

      const response = await axios.post(`${AUTH_SERVER}/api/register`, {

        botId: BOT_ID,

        phoneNumber,

        deviceInfo: this.getDeviceInfo()

      });

      if (response.data.success) {

        this.config.instanceId = response.data.instanceId;

        this.config.registeredAt = new Date().toISOString();

        this.config.status = 'pending';

        this.config.phoneNumber = phoneNumber;

        this.saveConfig();

      }

      return response.data;

    } catch (err) {

      console.error('Erreur lors de l\'enregistrement:', err.message);

      return {

        success: false,

        message: `Erreur lors de l'enregistrement: ${err.message}`

      };

    }

  }

  async validate() {

    try {

      // Vérifier si nous avons un ID d'instance

      if (!this.config.instanceId) {

        return {

          success: false,

          message: 'Instance non enregistrée'

        };

      }

      const response = await axios.post(`${AUTH_SERVER}/api/validate`, {

        botId: BOT_ID,

        phoneNumber: this.config.phoneNumber,

        instanceId: this.config.instanceId

      });

      if (response.data.success) {

        this.isAuthenticated = true;

        this.config.lastValidatedAt = new Date().toISOString();

        this.config.status = 'approved';

        this.config.expiresAt = response.data.expiresAt;

        this.saveConfig();

      } else {

        this.isAuthenticated = false;

        this.config.status = 'rejected';

        this.saveConfig();

      }

      return response.data;

    } catch (err) {

      console.error('Erreur lors de la validation:', err.message);

      // Si on reçoit une erreur 403, cela signifie que l'autorisation a été révoquée

      if (err.response && err.response.status === 403) {

        this.isAuthenticated = false;

        this.config.status = 'revoked';

        this.saveConfig();

      }

      return {

        success: false,

        message: `Erreur lors de la validation: ${err.message}`

      };

    }

  }

}

module.exports = AuthManager;