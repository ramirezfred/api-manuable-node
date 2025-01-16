const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Función para realizar la petición con Axios
const loginMan = async () => {
    try {
        const response = await axios.post(
            'http://ec2-34-209-178-62.us-west-2.compute.amazonaws.com:4000/api/session',
            {
                email: 'Usielleonfacturas@gmail.com',
                password: "9JqsAy%85'2^*8a_5",
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        return {
            error: 'Error al conectar con Manuable',
            manuable: error.message,
        };
    }
};

// Ruta para método GET
app.get('/', async (req, res) => {
    const manuable = await loginMan();
    res.json({
        status: 'success',
        message: 'Bienvenido a la API básica en NODEJS',
        manuable,
    });
});

// Ruta para crear un usuario
app.post('/createUser', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan parámetros (name, email)',
        });
    }

    const manuable = await loginMan();
    res.json({
        status: 'success',
        message: 'Usuario creado exitosamente',
        data: { name, email },
        manuable,
    });
});

// Ruta para procesar un formulario
app.post('/processForm', (req, res) => {
    const { field1, field2 } = req.body;

    if (!field1 || !field2) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan parámetros (field1, field2)',
        });
    }

    res.json({
        status: 'success',
        message: 'Formulario procesado correctamente',
        data: { field1, field2 },
    });
});

// Manejo de rutas no soportadas
app.use((req, res) => {
    res.status(405).json({
        status: 'error',
        message: 'Método no soportado',
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});