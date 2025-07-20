

    let boleta = [];
    let total = 0;


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
      precio.textContent = `Precio: S/ ${p.precio.toFixed(2)} por kg | Stock: ${p.stock} kg`;
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
  localStorage.setItem('productos', JSON.stringify(productos));
  window.location.href = `products.html?codigo=${p.codigo}`;
});
  });
}


    mostrarProductos();
    function llenarOpciones() {
  const select = document.getElementById("opcion");
  select.innerHTML = `<option value="0">Seleccione...</option>`;

  productos.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = p.codigo;
    option.textContent = p.nombre;
    select.appendChild(option);
  });

  const salir = document.createElement("option");
  salir.value = "999";
  salir.textContent = "Salir y mostrar boleta";
  select.appendChild(salir);
}

llenarOpciones();

  function seleccionarProducto() {
    const seleccion = parseInt(document.getElementById("opcion").value);
    const producto = productos.find(p => p.codigo === seleccion);
    const inputExtra = document.getElementById("inputExtra");
    inputExtra.innerHTML = "";

    if (!producto) {
      if (seleccion === 999) {
        mostrarBoleta();
      }
      return;
    }

    if (typeof producto.precio === 'number') {
      inputExtra.innerHTML = `
        <h4>${producto.nombre}</h4>
        <label>Cantidad en kilogramos: </label>
        <input type="number" id="kg" min="0.1" step="0.1" placeholder="Disponible: ${producto.stock} kg">
        <button onclick="agregarComida(${producto.codigo})">Comprar</button>
      `;
    } else {

      let html = `<h4>${producto.nombre}</h4>`;
      for (let talla in producto.precio) {
        html += `
          <div>
            <label>${talla} (S/.${producto.precio[talla]}): </label>
            <input type="number" id="cant${talla}" min="0" max="${producto.stock[talla]}" placeholder="0 (stock: ${producto.stock[talla]})">
          </div>
        `;
      }
      html += `<button onclick="agregarPrendaPorTallas(${producto.codigo})">Comprar</button>`;
      inputExtra.innerHTML = html;
    }
  }

    function agregarPrendaPorTallas(opcion) {
      const cantS = parseInt(document.getElementById("cantS").value) || 0;
      const cantM = parseInt(document.getElementById("cantM").value) || 0;
      const cantL = parseInt(document.getElementById("cantL").value) || 0;
      const cantXL = parseInt(document.getElementById("cantXL").value) || 0;

      const prod = productos.find(p => p.codigo === opcion);
      const tallas = { S: cantS, M: cantM, L: cantL, XL: cantXL };
      let algoSeVaAComprar = false;

      for (let t in tallas) {
        if (tallas[t] > 0) {
          algoSeVaAComprar = true;
          if (tallas[t] > prod.stock[t]) {
            alert(`No hay suficiente stock para talla ${t}. Solo quedan ${prod.stock[t]}.`);
            return;
          }
        }
      }

      if (!algoSeVaAComprar) {
        alert("Debe ingresar al menos una cantidad mayor a 0.");
        return;
      }

      // Agregar a boleta y restar stock
      for (let t in tallas) {
        const cantidad = tallas[t];
        if (cantidad > 0) {
          const subtotal = cantidad * prod.precio[t];
          total += subtotal;
          prod.stock[t] -= cantidad;
          boleta.push(`${cantidad} ${prod.nombre} - talla ${t} : S/ ${subtotal.toFixed(2)}`);
        }
      }

      alert("Producto(s) agregado(s) a la boleta.");
      document.getElementById("inputExtra").innerHTML = "";
      mostrarProductos();
    }

  function agregarComida(opcion) {
    const kg = parseFloat(document.getElementById("kg").value);
    const prod = productos.find(p => p.codigo === opcion);

    if (kg > 0) {
      if (kg <= prod.stock) {
        const subtotal = kg * prod.precio;
        total += subtotal;
        prod.stock -= kg;
        boleta.push(`${kg} kg ${prod.nombre} : S/ ${subtotal.toFixed(2)}`);
        alert("Producto agregado a la boleta.");
        document.getElementById("inputExtra").innerHTML = "";
        mostrarProductos();
      } else {
        alert(`Stock insuficiente. Solo quedan ${prod.stock} kg disponibles.`);
      }
    } else {
      alert("Ingrese una cantidad válida.");
    }
  }


    function mostrarBoleta() {
      let resultado = "<h2>------ BOLETA DE VENTA ------</h2>";
      if (boleta.length === 0) {
        resultado += "<p>No se compró ningún producto.</p>";
      } else {
        boleta.forEach(item => {
          resultado += `<p>${item}</p>`;
        });
        resultado += "<hr>";
        resultado += `<strong>TOTAL A PAGAR: S/ ${total.toFixed(2)}</strong>`;
      }
      document.getElementById("boleta").innerHTML = resultado;
    }