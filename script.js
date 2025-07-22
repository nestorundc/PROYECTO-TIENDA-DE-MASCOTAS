async function cargarHeader() {
  try {
    const respuesta = await fetch('header.html');
    if (!respuesta.ok) {
      throw new Error(`Error al cargar header: ${respuesta.status}`);
    }
    const html = await respuesta.text();
    document.getElementById('header-container').innerHTML = html;
  } catch (error) {
    console.error('No se pudo cargar el header:', error);
  }
}

cargarHeader();

function mostrarProductos() {
  const divProductos = document.getElementById('productos');
  divProductos.innerHTML = '';

  productos.forEach(p => {
    const productCard = document.createElement('div');
    productCard.classList.add('productCard');

    // Div para imagen del producto
    const divImg = document.createElement('div');
    divImg.classList.add('divImg');
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.nombre;
    divImg.appendChild(img);

    // Div para información del producto
    const divInformacion = document.createElement('div');
    divInformacion.classList.add('divInformacion');

    const nombre = document.createElement('h3');
    nombre.textContent = p.nombre;

    const precio = document.createElement('h4');

    // Detectar si es producto de comida o ropa
    if (typeof p.precio === 'number') {
      // Producto de comida
      precio.textContent = `S/ ${p.precio.toFixed(2)} por kg`;
    } else {

      // Producto de ropa con tallas
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

    // Agregar ambos divs a la card del producto
    productCard.appendChild(divImg);
    productCard.appendChild(divInformacion);

    // Agregar card de productos al contenedor principal
    divProductos.appendChild(productCard);
    productCard.addEventListener('click', () => {
      window.location.href = `products.html?codigo=${p.codigo}`;
    });
  });
}

mostrarProductos();