// Module de gestion d'authentification pour les commandes du bot

// Fichier: Plugins/access.js

const { cmd } = require('../command');

const axios = require('axios');

cmd({

    pattern: "authlist",

    desc: "Liste toutes les instances de bot enregistrées",

    category: "owner",

    filename: __filename

},

async(conn, mek, m, {from, sender, senderNumber, isCmd, command, args, q, isGroup, quoted, botNumber, pushname, isMe, isOwner, reply}) => {

    try {

        if (!isOwner) return reply("❌ Cette commande est réservée au propriétaire");

        

        const AUTH_SERVER = 'https://botac.vercel.app';

        const ADMIN_API_KEY = 'andy6916';

        

        try {

            const response = await axios.get(`${AUTH_SERVER}/api/instances`, {

                headers: {

                    'x-admin-key': ADMIN_API_KEY

                }

            });

            

            if (!response.data.success) {

                return reply(`❌ Erreur: ${response.data.message}`);

            }

            

            const instances = response.data.instances;

            

            if (instances.length === 0) {

                return reply('Aucune instance enregistrée');

            }

            

            // Construction du message de réponse

            let message = `*INSTANCES DE BOT ENREGISTRÉES*\n\n`;

            

            for (let i = 0; i < instances.length; i++) {

                const inst = instances[i];

                message += `*${i+1}. ${inst.phoneNumber}*\n`;

                message += `  • ID: ${inst.instanceId.substring(0, 50)}...\n`;

                message += `  • Status: ${inst.status}\n`;

                message += `  • Créé le: ${new Date(inst.createdAt).toLocaleString()}\n`;

                if (inst.expiresAt) {

                    message += `  • Expire le: ${new Date(inst.expiresAt).toLocaleString()}\n`;

                }

                message += `\n`;

            }

            

            reply(message);

            

        } catch (error) {

            console.error('Error:', error);

            reply(`❌ Erreur: ${error.message}`);

        }

    } catch (e) {

        console.error(e);

        reply(`❌ Erreur: ${e.message}`);

    }

});

cmd({

    pattern: "authapprove",

    desc: "Approuver une instance de bot",

    category: "owner",

    filename: __filename

},

async(conn, mek, m, {from, sender, senderNumber, isCmd, command, args, q, isGroup, quoted, botNumber, pushname, isMe, isOwner, reply}) => {

    try {

        if (!isOwner) return reply("❌ Cette commande est réservée au propriétaire");

        

        const AUTH_SERVER = 'https://botac.vercel.app';

        const ADMIN_API_KEY = 'andy6916';

        

        if (!q) {

            return reply(`❌ Format: .authapprove <instanceId> <jours>`);

        }

        

        const argArray = q.trim().split(' ');

        

        if (argArray.length < 2) {

            return reply(`❌ Format: .authapprove <instanceId> <jours>`);

        }

        

        const instanceId = argArray[0];

        const days = parseInt(argArray[1]);

        

        if (isNaN(days)) {

            return reply('❌ Le nombre de jours doit être un nombre valide');

        }

        

        try {

            const response = await axios.post(`${AUTH_SERVER}/api/authorize`, {

                instanceId,

                expiresInDays: days

            }, {

                headers: {

                    'x-admin-key': ADMIN_API_KEY

                }

            });

            

            if (!response.data.success) {

                return reply(`❌ Erreur: ${response.data.message}`);

            }

            

            const auth = response.data.authorization;

            

            reply(`✅ *INSTANCE APPROUVÉE*

┌───────「 DÉTAILS 」───────┐

│ 📱 NUMÉRO: ${auth.phoneNumber}

│ 🆔 ID: ${auth.instanceId.substring(0, 8)}...

│ ⏱️ EXPIRE: Dans ${days} jours

│ 📅 DATE: ${new Date().toLocaleString()}

└─────────────────────────────┘`);

            

        } catch (error) {

            console.error('Error:', error);

            reply(`❌ Erreur: ${error.message}`);

        }

        

    } catch (e) {

        console.error(e);

        reply(`❌ Erreur: ${e.message}`);

    }

});

cmd({

    pattern: "authrevoke",

    desc: "Révoquer une instance de bot",

    category: "owner",

    filename: __filename

},

async(conn, mek, m, {from, sender, senderNumber, isCmd, command, args, q, isGroup, quoted, botNumber, pushname, isMe, isOwner, reply}) => {

    try {

        if (!isOwner) return reply("❌ Cette commande est réservée au propriétaire");

        

        const AUTH_SERVER = 'https://botac.vercel.app';

        const ADMIN_API_KEY = 'andy6916';

        

        if (!q) {

            return reply(`❌ Format: .authrevoke <instanceId>`);

        }

        

        const instanceId = q.trim();

        

        try {

            const response = await axios.post(`${AUTH_SERVER}/api/revoke`, {

                instanceId

            }, {

                headers: {

                    'x-admin-key': ADMIN_API_KEY

                }

            });

            

            if (!response.data.success) {

                return reply(`❌ Erreur: ${response.data.message}`);

            }

            

            reply(`✅ *INSTANCE RÉVOQUÉE* ✅

L'instance ${instanceId.substring(0, 8)}... a été révoquée avec succès.

Le bot sera automatiquement arrêté à sa prochaine vérification.`);

            

        } catch (error) {

            console.error('Error:', error);

            reply(`❌ Erreur: ${error.message}`);

        }

        

    } catch (e) {

        console.error(e);

        reply(`❌ Erreur: ${e.message}`);

    }

});