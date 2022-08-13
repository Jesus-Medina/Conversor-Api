const servidorApi = "https://mindicador.cl/api"
let endpointApi = "https://mindicador.cl/api/dolar"

//Al cargar la ventana generamos nuestro template con la API
window.addEventListener("load", cargarCosas)

//FUNCIONES
async function cargarCosas() {
    try {
        const res = await fetch(servidorApi)
        const data = await res.json()
        createCard(data)
    } catch (e) {
        manejoDeErrores(e)
    }
}

//funcion para crear la carta
function createCard(data) {
    //creamos la seccion principal
    const section = document.createElement("section")
    section.classList.add("container-flex")
    //creamos el DIV que contendra a todos nuestros elementos
    const div = document.createElement("div")
    div.classList.add("card-container")
    //creamos el DIV que contendra el grafico
    const graficoDiv = document.createElement("div")
    graficoDiv.classList.add("chart-container")
    //creamos el titulo de nuestro conversor 
    const titulo = document.createElement("p")
    titulo.classList.add("titulo-conversor")
    titulo.textContent = "Conversor de Monedas Internacionales a CLP 🇨🇱"
    div.appendChild(titulo)
    //creamos un DIV hijo del DIV principal para ordenar los elementos
    const divInput = document.createElement("div")
    divInput.classList.add("input-container")
    //creamos un DIV hijo del DIV secundario para ordenar los elementos
    const separacionDiv = document.createElement("div")
    //creamos el SELECT
    const select = document.createElement("select")
    //creamos el segundo option de UF
    const optionUSD= document.createElement("option")
    optionUSD.value = data.dolar.valor
    optionUSD.textContent = data.dolar.codigo
    optionUSD.id = data.dolar.nombre
    select.appendChild(optionUSD)
    //creamos el segundo option de UF
    const optionUF = document.createElement("option")
    optionUF.value = data.uf.valor
    optionUF.textContent = data.uf.codigo
    optionUF.id = data.uf.nombre
    select.appendChild(optionUF)
    //agregamos nuestros option al select
    separacionDiv.appendChild(select)
    //creamos el INPUT
    const input = document.createElement("input")
    input.type = "text"
    input.value = 0
    separacionDiv.appendChild(input)
    //creamos boton
    const button = document.createElement("button")
    button.textContent = `Calcular ${select.selectedOptions[0].id}`
    //agregamos nuestro DIV al DIV secundario
    divInput.appendChild(separacionDiv)
    divInput.appendChild(button)
    //Creamos el parrafo del total de la conversion
    const parrafoResultado = document.createElement("p")
    parrafoResultado.classList.add("parrafoResultado")
    parrafoResultado.textContent = `$ 0.0 ${select.selectedOptions[0].id}💸`
    divInput.appendChild(parrafoResultado)
    //renderizamos el grafico
    renderGrafica(div, graficoDiv)
    //agregamos nuestro DIV secundario al DIV principal
    div.appendChild(divInput)
    //Agregamos el DIV prinicpal a nuestra seccion principal
    section.appendChild(div)
    //mostramos la seccion en el body
    document.body.appendChild(section)

    //listeners para los inputs
    monitorearDatos(button, select, input, div, graficoDiv)
}

//funcion para hacer los calculos
function monitorearDatos(button, select, input, div, graficoDiv) {
    let total = 0
    let valor = select.value
    const parrafoAmodificar = document.querySelector(".parrafoResultado")
    select.addEventListener("change", () => {
        valor = select.value
        endpointApi = `https://mindicador.cl/api/${select.selectedOptions[0].textContent}`
        renderGrafica(div, graficoDiv)
        if (input.value.length > 0) {
            total = parseInt(input.value) / parseInt(valor)
            total = total.toFixed(2)
            parrafoAmodificar.textContent = `$ ${total} ${select.selectedOptions[0].id}💸`
        }
    })

    button.addEventListener("click", () => {
        total = parseInt(input.value) / parseInt(valor)
        total = total.toFixed(2)
        parrafoAmodificar.textContent = `$ ${total} ${select.selectedOptions[0].id}💸`
        endpointApi = `https://mindicador.cl/api/${select.selectedOptions[0].textContent}`
        getMonedasInfo(endpointApi)
    })

    input.addEventListener("keyup", () => {
        input.value = input.value.replace(/[^0-9]/g, "")
    })
}

async function getMonedasInfo(endpointApi) {
    try {    
        const endpoint = endpointApi
        const res = await fetch(endpoint)
        const monedas = await res.json()
        return monedas;
    } catch (e) {
        manejoDeErrores(e)
    }
}

async function renderGrafica(div, graficoDiv) {
    try {
        graficoDiv.innerHTML = ""
        const valoresHistoricos = await getMonedasInfo(endpointApi)
        const config = prepararConfiguracionParaLaGrafica(valoresHistoricos)
        const chartDOM = document.createElement("canvas")
        chartDOM.id = "myChart"
        graficoDiv.appendChild(chartDOM)
        div.appendChild(graficoDiv)
        new Chart(chartDOM, config)
    } catch (e) {
        manejoDeErrores(e)
    }
}

function prepararConfiguracionParaLaGrafica(datos) {
    // Creamos las variables necesarias para el objeto de configuración
    const tipoDeGrafica = "line"
    const nombreDeLaMoneda = datos.codigo
    const titulo = `precio del ${nombreDeLaMoneda}`
    const colorDeLinea = "red"
    const convertirValoresArreglo = datos.serie.map((elemento) => elemento.valor)
    const convertirFechasArreglo = datos.serie.map((elemento) => elemento.fecha)
    let valoresMoneda = []
    for(let i = 0; i < 10; i++){
        valoresMoneda.push(convertirValoresArreglo[i]) 
    }
    valoresMoneda.reverse()
    let fechasMoneda = []
    for(let i = 0; i < 10; i++){
        fechasMoneda.push(convertirFechasArreglo[i]) 
    }
    fechasMoneda.reverse()
    console.log(valoresMoneda)
    console.log(fechasMoneda)

    const config = {
        type: tipoDeGrafica,
        data: {
            labels: fechasMoneda,
            datasets: [{
                label: titulo,
                backgroundColor: colorDeLinea,
                data: valoresMoneda
            }]
        }
    };
    return config
}   

//funcion para control de errores
function manejoDeErrores(e) {
    document.body.innerHTML = ""
    const section = document.createElement("section")
    section.classList.add("main-section")

    const error = document.createElement("p")
    error.classList.add("error-message")
    error.textContent = `¡Algo malio sal! Error:${e.message}.. 😿`
    section.appendChild(error)
    document.body.appendChild(section)
}