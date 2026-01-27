const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Esto mostrará tu HTML

// Conexión a MongoDB usando la variable de entorno
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a la Base de Datos'))
    .catch(err => console.error('Error conectando a Mongo:', err));

// Configuración del Contador
const ContadorSchema = new mongoose.Schema({
    _id: String,
    seq: Number
});
const Contador = mongoose.model('Contador', ContadorSchema);

// Función: Si es la primera vez, empieza en 61600
async function initCounter() {
    try {
        const existe = await Contador.findById('guia_id');
        if (!existe) {
            await new Contador({ _id: 'guia_id', seq: 61600 }).save();
            console.log("Contador inicializado en 61600");
        }
    } catch (e) {
        console.log("Esperando conexión DB...");
    }
}
initCounter();

// API: Cuando la web pida un número, sumamos 1 y lo enviamos
app.get('/api/siguiente-numero', async (req, res) => {
    try {
        const resultado = await Contador.findByIdAndUpdate(
            'guia_id',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        res.json({ numero: resultado.seq });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar número' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));