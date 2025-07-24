async function cargarHeader() {
  try {
    const respuesta = await fetch('header.html');
    if (!respuesta.ok) throw new Error(`Error al cargar header: ${respuesta.status}`);
    const html = await respuesta.text();
    document.getElementById('header-container').innerHTML = html;

    setTimeout(() => {
      actualizarContadorCarrito();
    }, 0);

  } catch (error) {
    console.error('No se pudo cargar el header:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarHeader(() => {
    actualizarContadorCarrito();
  });

  mostrarDetalleProducto();
});

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let totalCantidad = carrito.reduce((total, item) => total + item.cantidad, 0);

  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = totalCantidad;
  }
}

function mostrarProductos() {
  const divProductos = document.getElementById('productos');
  divProductos.innerHTML = '';

  productos.forEach(p => {
    const productCard = document.createElement('div');
    productCard.classList.add('productCard');


    const divImg = document.createElement('div');
    divImg.classList.add('divImg');
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.nombre;
    divImg.appendChild(img);

    const divInformacion = document.createElement('div');
    divInformacion.classList.add('divInformacion');

    const nombre = document.createElement('h3');
    nombre.textContent = p.nombre;

    const precio = document.createElement('h4');

    if (typeof p.precio === 'number') {
      precio.textContent = `S/ ${p.precio.toFixed(2)} por kg`;
    } else {

      const valores = Object.values(p.precio);
      const todosIguales = valores.every(v => v === valores[0]);
      const menor = Math.min(...valores);
      const mayor = Math.max(...valores);

      precio.innerHTML = todosIguales
        ? `<span style="color: #555;">S/ ${menor}</span>`
        : `<span style="color: #555;">S/ ${menor} - S/ ${mayor}</span>`;
    }

    divInformacion.appendChild(nombre);
    divInformacion.appendChild(precio);

    productCard.appendChild(divImg);
    productCard.appendChild(divInformacion);

    divProductos.appendChild(productCard);
    productCard.addEventListener('click', () => {
      window.location.href = `products.html?codigo=${p.codigo}`;
    });
  });
}

mostrarProductos();