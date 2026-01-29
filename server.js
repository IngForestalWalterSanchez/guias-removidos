const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.static('public')); 

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado a la Base de Datos'))
    .catch(err => console.error('Error conectando a Mongo:', err));

// Configuración del Contador
const ContadorSchema = new mongoose.Schema({
    _id: String,
    seq: Number
});
const Contador = mongoose.model('Contador', ContadorSchema);

// --- CAMBIOS AQUÍ ---
// Cambiamos el ID a 'guia_nueva_2025' para que MongoDB cree uno nuevo desde cero.
const ID_CONTADOR = 'guia_nueva_2025'; 

async function initCounter() {
    try {
        const existe = await Contador.findById(ID_CONTADOR);
        if (!existe) {
            // Empezamos en 0, para que el primero sea el 1
            await new Contador({ _id: ID_CONTADOR, seq: 0 }).save();
            console.log("Contador inicializado en 0");
        }
    } catch (e) {
        console.log("Esperando conexión DB...");
    }
}
initCounter();

app.get('/api/siguiente-numero', async (req, res) => {
    try {
        const resultado = await Contador.findByIdAndUpdate(
            ID_CONTADOR,
            { $inc: { seq: 1 } }, // Sumar 1
            { new: true, upsert: true }
        );
        
        // --- TRUCO PARA LOS CEROS (00001) ---
        // Convertimos el número a texto y le agregamos ceros a la izquierda
        const numeroFormateado = String(resultado.seq).padStart(5, '0');

        res.json({ numero: numeroFormateado });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar número' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
