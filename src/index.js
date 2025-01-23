const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

//Produccion
// const api_url = "http://ec2-34-209-178-62.us-west-2.compute.amazonaws.com:4000/api";
// const api_email = "Usielleonfacturas@gmail.com";
// const api_password = "9JqsAy%85'2^*8a_5";

//Pruebas
const api_url = "http://ec2-54-188-18-143.us-west-2.compute.amazonaws.com:4000/api";
const api_email = "Usielleonfacturas@gmail.com";
const api_password = "6sa452_{14N6";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Función para realizar la petición con Axios
const loginMan = async () => {
    try {
        const response = await axios.post(
            api_url+'/session',
            {
                email: api_email,
                password: api_password,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // return response.data;

        if ('token' in response.data) {
            return {
                status: 'success',
                manuable: response.data
            };
        } else if ('errors' in response.data) {
            return {
                status: 'error',
                message: response.data.errors.details,
                manuable: response.data
            };
        } else {
            return {
                status: 'error',
                message: 'Error en formato de la respuesta',
                manuable: response.data
            };
        }

    } catch (error) {
        
        if (error.response) {
            // Error de respuesta desde la API
            const { status, data } = error.response;
            return {
                status: 'error',
                message: data.error || 'Error en la API externa',
                manuable: data,
            };
        } else {
            // Error de conexión u otro tipo de excepción
            return {
                status: 'error',
                message: 'Error al conectar con Manuable',
                manuable: error.message,
            };
        }
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

// Ruta para método GET
app.get('/login', async (req, res) => {

    const respuesta = await loginMan();

    if(respuesta.status == 'success'){
        return res.json({
            status: 'success',
            message: 'success',
            manuable: respuesta.manuable,
        });
    }else{
        res.status(400).json({
            status: 'error',
            message: respuesta.message,
            manuable: respuesta.manuable,
        });
    }
    
});

app.post('/cotizar', async (req, res) => {

    const { O_zip_code, D_zip_code, height, length, width, weight } = req.body;

    if (!O_zip_code || !D_zip_code || !height || !length || !width || !weight) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan parámetros (O_zip_code, D_zip_code, height, length, width, weight)',
        });
    }

    const respuesta = await loginMan();

    let token = "";

    if(respuesta.status == 'success'){
        token = respuesta.manuable.token;
    }else{
        return res.status(500).json({
            status: 'error',
            message: respuesta.message,
            manuable: respuesta.manuable,
        });
    }

    try {
        const response = await axios.post(
            api_url+'/rates',
            {
                address_from: {
                    country_code: "MX",
                    zip_code: O_zip_code // variable en Node.js
                },
                address_to: {
                    country_code: "MX",
                    zip_code: D_zip_code // variable en Node.js
                },
                parcel: {
                    currency: "MXN",
                    distance_unit: "CM",
                    height: height,
                    length: length,
                    mass_unit: "KG",
                    weight: weight,
                    width: width
                }
            },
            {
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/json',
                },
            }
        );

        // return response.data;

        if (Object.prototype.hasOwnProperty.call(response.data, 'data')) {
            return res.json({
                status: 'success',
                message: 'success',
                manuable: response.data,
            });
        } else {
            return res.status(409).json({
                status: 'error',
                message: 'Error en formato de la respuesta',
                manuable: response.data,
            });
        }

    } catch (error) {

        if (error.response) {
            // Error de respuesta desde la API
            const { status, data } = error.response;
            return res.status(status).json({
                status: 'error',
                message: data.error || 'Error en la API externa',
                manuable: data,
            });
        } else {
            // Error de conexión u otro tipo de excepción
            res.status(500).json({
                status: 'error',
                message: 'Sin respuesta',
                manuable: error.message,
            });
        }

    }
    
});

app.post('/ordenar', async (req, res) => {

    const {
        name_from,
        street1_from,
        neighborhood_from,
        external_number_from,
        city_from,
        state_from,
        phone_from,
        reference_from,
    
        name_to,
        street1_to,
        neighborhood_to,
        external_number_to,
        city_to,
        state_to,
        phone_to,
        reference_to,
    
        product_value,
        content,
        rate_token
    } = req.body;

    if (!name_from || !street1_from || !neighborhood_from || !external_number_from || !city_from || !state_from || !phone_from || !reference_from ||
        !name_to || !street1_to || !neighborhood_to || !external_number_to || !city_to || !state_to || !phone_to || !reference_to ||
        !product_value || !content || !rate_token) {
        return res.status(400).json({
            status: 'error',
            message: 'Faltan parámetros (name_from, street1_from, neighborhood_from, external_number_from, city_from, state_from, phone_from, reference_from, name_to, street1_to, neighborhood_to, external_number_to, city_to, state_to, phone_to, reference_to, product_value, content, rate_token)',
        });
    }

    const respuesta = await loginMan();

    let token = "";

    if(respuesta.status == 'success'){
        token = respuesta.manuable.token;
    }else{
        return res.status(500).json({
            status: 'error',
            message: respuesta.message,
            manuable: respuesta.manuable,
        });
    }

    try {
        const response = await axios.post(
            api_url+'/labels',
            {
                "address_from": {
                  "name": name_from,
                  "street1": street1_from,
                  "neighborhood": neighborhood_from,
                  "external_number": external_number_from,
                  "city": city_from,
                  "state": state_from,
                  "phone": phone_from,
                  "email": "atn@nennuu.mx",
                  "country": "MEXICO",
                  "country_code": "MX",
                  "reference": reference_from
                },
                "address_to": {
                  "name": name_to,
                  "street1": street1_to,
                  "neighborhood": neighborhood_to,
                  "external_number": external_number_to,
                  "city": city_to,
                  "state": state_to,
                  "phone": phone_to,
                  "email": "atn@nennuu.mx",
                  "country": "MEXICO",
                  "country_code": "MX",
                  "reference": reference_to
                },
                "parcel": {
                  "currency": "MXN",
                  "product_id": "0",
                  "product_value": product_value,
                  "quantity_products": 1,
                  "content": content //(antes reason_code)
                },
                "label_format": "PDF",
                "rate_token": rate_token
            },
            {
                headers: {
                    'Authorization': 'Bearer '+token,
                    'Content-Type': 'application/json',
                },
            }
        );

        // return response.data;

        if (Object.prototype.hasOwnProperty.call(response.data, 'data')) {
            return res.json({
                status: 'success',
                message: 'success',
                manuable: response.data,
            });
        } else {
            return res.status(409).json({
                status: 'error',
                message: 'Error en formato de la respuesta',
                manuable: response.data,
            });
        }

    } catch (error) {

        if (error.response) {
            // Error de respuesta desde la API
            const { status, data } = error.response;
            return res.status(status).json({
                status: 'error',
                message: data.error || 'Error en la API externa',
                manuable: data,
            });
        } else {
            // Error de conexión u otro tipo de excepción
            res.status(500).json({
                status: 'error',
                message: 'Sin respuesta',
                manuable: error.message,
            });
        }

    }
    
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