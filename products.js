async function cargarHeader() {
    try {
        const header = await fetch('header.html');
        if (!header.ok) {
            throw new Error(`Error al cargar header: ${header.status}`);
        }

        const html = await header.text();
        document.getElementById('header-container').innerHTML = html;

        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('#contadorCarrito')) {
                actualizarContadorCarrito();
                obs.disconnect();
            }
        });

        observer.observe(document.getElementById('header-container'), {
            childList: true,
            subtree: true
        });

    } catch (error) {
        console.error('No se pudo cargar el header:', error);
    }
}

cargarHeader();

const codigoProductoSelecionado = parseInt(new URLSearchParams(window.location.search).get('codigo'));

let productosStock = JSON.parse(localStorage.getItem('productosStock')) || productos;
const producto = productosStock.find(p => p.codigo === codigoProductoSelecionado);

const contenedor = document.getElementById('detalleProducto');
const imagenProducto = document.querySelector('.imagenProducto');
const nombreProducto = document.querySelector('.nombreProducto');
const detalleProducto = document.querySelector('.detalleProducto');

const img = document.createElement('img');
img.src = producto.img
img.alt = producto.nombre
imagenProducto.appendChild(img);

const nombre = document.createElement('h3');
nombre.textContent = producto.nombre;
nombreProducto.appendChild(nombre);

const descripcion = document.createElement('p');
descripcion.textContent = producto.descripcion;
detalleProducto.appendChild(descripcion);

if (typeof producto.precio === 'number') {
    const precio = document.createElement('p');
    precio.classList.add('precioProducto');
    precio.textContent = `Precio por kilo: S/ ${producto.precio}`;
    detalleProducto.appendChild(precio);

    const stock = document.createElement('p');
    stock.classList.add('stockProducto');
    stock.textContent = `Stock disponible: ${producto.stock} kg`;
    detalleProducto.appendChild(stock);

} else {
    const label = document.createElement('label');
    label.textContent = "Selecciona una talla:";
    label.classList.add('labelTalla');
    detalleProducto.appendChild(label);

    const tallas = ["S", "M", "L", "XL"];
    const contenedorBotones = document.createElement('div');
    contenedorBotones.classList.add('botonesTalla');
    detalleProducto.appendChild(contenedorBotones);

    const precioTalla = document.createElement('p');
    const stockTalla = document.createElement('p');
    precioTalla.classList.add('precioTalla');
    stockTalla.classList.add('stockTalla');
    detalleProducto.appendChild(precioTalla);
    detalleProducto.appendChild(stockTalla);

    tallas.forEach(talla => {
        const boton = document.createElement('button');
        boton.textContent = talla;
        boton.classList.add('botonTalla');
        boton.dataset.talla = talla;

        boton.addEventListener('click', () => {

            const botones = contenedorBotones.querySelectorAll('button');
            botones.forEach(b => b.classList.remove('activo'));

            boton.classList.add('activo');

            precioTalla.textContent = `S/ ${producto.precio[talla]}`;
            stockTalla.textContent = `Stock disponible: ${producto.stock[talla]} unidades`;

            producto.tallaSeleccionada = talla;
        });

        contenedorBotones.appendChild(boton);
    });
}


const cantidadWrapper = document.createElement('div');
cantidadWrapper.classList.add('cantidadWrapper');

const botonMenos = document.createElement('button');
botonMenos.textContent = '-';
botonMenos.className = 'btnCantidad';

const inputCantidad = document.createElement('input');
inputCantidad.type = 'text';
inputCantidad.id = 'inputCantidad';
inputCantidad.value = 1;
inputCantidad.readOnly = true;

const botonMas = document.createElement('button');
botonMas.textContent = '+';
botonMas.className = 'btnCantidad';

botonMenos.addEventListener('click', () => {
    let cantidad = parseInt(inputCantidad.value);
    if (cantidad > 1) inputCantidad.value = cantidad - 1;
});

botonMas.addEventListener('click', () => {
    let cantidad = parseInt(inputCantidad.value);
    inputCantidad.value = cantidad + 1;
});

cantidadWrapper.appendChild(botonMenos);
cantidadWrapper.appendChild(inputCantidad);
cantidadWrapper.appendChild(botonMas);

detalleProducto.appendChild(cantidadWrapper);



const botonCarrito = document.createElement('button');
botonCarrito.textContent = "Añadir al carrito";
botonCarrito.classList.add('botonCarrito');
detalleProducto.appendChild(botonCarrito);

botonCarrito.addEventListener('click', () => {
    const tallaSeleccionada = (typeof producto.precio !== 'number')
        ? document.querySelector('.botonTalla.activo')?.dataset.talla
        : null;
    if (typeof producto.precio !== 'number' && !tallaSeleccionada) {
        Swal.fire({
            icon: 'warning',
            title: 'Talla no seleccionada',
            text: 'Por favor, selecciona una talla antes de añadir al carrito.',
        });
        return;
    }

    const cantidadSeleccionada = Math.max(1, parseInt(document.getElementById('inputCantidad').value) || 1);

    if (typeof producto.stock === 'object' && tallaSeleccionada) {
        if (producto.stock[tallaSeleccionada] < cantidadSeleccionada) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `Solo hay ${producto.stock[tallaSeleccionada]} unidades disponibles para la talla ${tallaSeleccionada}.`,
            });
            return;
        }
    } else if (typeof producto.stock === 'number') {
        if (producto.stock < cantidadSeleccionada) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `Solo hay ${producto.stock} kilos disponibles.`,
            });
            return;
        }
    }

    if (typeof producto.stock === 'object' && tallaSeleccionada) {
        producto.stock[tallaSeleccionada] -= cantidadSeleccionada;
    } else if (typeof producto.stock === 'number') {
        producto.stock -= cantidadSeleccionada;
    }

    localStorage.setItem('productosStock', JSON.stringify(productosStock));

    const productoCarrito = {
        codigo: producto.codigo,
        nombre: producto.nombre,
        img: producto.img,
        talla: tallaSeleccionada,
        precio: (typeof producto.precio === 'number') ? producto.precio : producto.precio[tallaSeleccionada],
        cantidad: cantidadSeleccionada
    };

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    const index = carrito.findIndex(item => item.codigo === productoCarrito.codigo && item.talla === productoCarrito.talla);
    if (index !== -1) {
        carrito[index].cantidad += cantidadSeleccionada;
    } else {
        carrito.push(productoCarrito);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    Swal.fire({
        icon: 'success',
        title: '¡Agregado al carrito!',
        text: 'El producto se añadió correctamente.',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        window.location.reload();
    });
});
document.addEventListener('DOMContentLoaded', () => {
    cargarHeader(() => {
        actualizarContadorCarrito();
    });

});


