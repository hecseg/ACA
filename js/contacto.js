/**
 * Rosc Fine Ferretería - Lógica de Interacción, Validación y Horario Dinámico
 * Archivo: js/contacto.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar módulos
  initHorarioComercial();
  initValidacionFormulario();
  initMenuMovil();
});

/* ==========================================================================
   1. Lógica Dinámica de Horario Comercial (Extra)
   Horario: Lunes a Sábado de 8:00 a.m. a 6:00 p.m.
   ========================================================================== */
function initHorarioComercial() {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');

  if (!statusIndicator || !statusText) return;

  function actualizarEstadoHorario() {
    const ahora = new Date();
    const dia = ahora.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const hora = ahora.getHours(); // 0 a 23
    const minutos = ahora.getMinutes();
    const minutosTotales = hora * 60 + minutos;

    // Rango de atención: 8:00 a.m. (480 mins) a 6:00 p.m. (1080 mins)
    const inicioJornada = 8 * 60;   // 08:00 am
    const finJornada = 18 * 60;     // 06:00 pm

    // Lunes (1) a Sábado (6)
    const esDiaHabil = dia >= 1 && dia <= 6;
    const esHoraAtencion = minutosTotales >= inicioJornada && minutosTotales < finJornada;
    const estaAbierto = esDiaHabil && esHoraAtencion;

    if (estaAbierto) {
      statusIndicator.classList.remove('closed');
      statusIndicator.classList.add('open');
      statusText.textContent = '🟢 Abierto ahora';
      statusIndicator.setAttribute(
        'title', 
        '¡Estamos atendiendo! Lunes a Sábado de 8:00 a.m. a 6:00 p.m.'
      );
    } else {
      statusIndicator.classList.remove('open');
      statusIndicator.classList.add('closed');
      statusText.textContent = '🔴 Cerrado por ahora';
      statusIndicator.setAttribute(
        'title', 
        'Fuera de horario comercial. Abrimos de Lunes a Sábado a las 8:00 a.m.'
      );
    }
  }

  // Ejecución inmediata al cargar la página
  actualizarEstadoHorario();

  // Actualización automática cada 60 segundos
  setInterval(actualizarEstadoHorario, 60000);
}

/* ==========================================================================
   2. Validación de Formulario de Contacto
   ========================================================================== */
function initValidacionFormulario() {
  const form = document.getElementById('formulario-contacto');
  const inputNombre = document.getElementById('nombre');
  const inputTelefono = document.getElementById('telefono');
  const inputMensaje = document.getElementById('mensaje');
  const feedbackContainer = document.getElementById('form-feedback');
  const errorNombre = document.getElementById('error-nombre');
  const errorMensaje = document.getElementById('error-mensaje');
  const btnEnviar = document.getElementById('btn-enviar');

  if (!form || !inputNombre || !inputMensaje || !feedbackContainer) return;

  let temporizadorMensaje = null;

  // Escuchar evento submit
  form.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Detener el envío tradicional

    // Limpiar alertas previas
    limpiarErrores();

    const nombreVal = inputNombre.value.trim();
    const mensajeVal = inputMensaje.value.trim();
    let hayErrores = false;
    let primerCampoInvalido = null;

    // Validación 1: Campo Nombre no vacío y mínimo 2 caracteres
    if (nombreVal === '') {
      marcarCampoError(inputNombre, errorNombre, 'Por favor, ingresa tu nombre completo.');
      hayErrores = true;
      if (!primerCampoInvalido) primerCampoInvalido = inputNombre;
    } else if (nombreVal.length < 2) {
      marcarCampoError(inputNombre, errorNombre, 'El nombre debe contener al menos 2 caracteres.');
      hayErrores = true;
      if (!primerCampoInvalido) primerCampoInvalido = inputNombre;
    }

    // Validación 2: Campo Mensaje no vacío
    if (mensajeVal === '') {
      marcarCampoError(inputMensaje, errorMensaje, 'Por favor, redacta el mensaje o detalle de tu cotización.');
      hayErrores = true;
      if (!primerCampoInvalido) primerCampoInvalido = inputMensaje;
    }

    // Si no cumple las condiciones
    if (hayErrores) {
      mostrarMensajeAlerta(
        'Por favor, corrige los campos resaltados en rojo antes de enviar.',
        'error'
      );
      if (primerCampoInvalido) {
        primerCampoInvalido.focus();
      }
      return;
    }

    // Si cumple las condiciones: Éxito
    procesarEnvioExitoso(nombreVal);
  });

  // Limpiar estilos de error en tiempo real cuando el usuario escribe
  inputNombre.addEventListener('input', () => {
    if (inputNombre.value.trim().length >= 2) {
      desmarcarCampo(inputNombre, errorNombre);
    }
  });

  inputMensaje.addEventListener('input', () => {
    if (inputMensaje.value.trim() !== '') {
      desmarcarCampo(inputMensaje, errorMensaje);
    }
  });

  function marcarCampoError(input, errorSpan, mensaje) {
    input.classList.add('input-error');
    if (errorSpan) {
      errorSpan.textContent = mensaje;
      errorSpan.classList.add('visible');
    }
  }

  function desmarcarCampo(input, errorSpan) {
    input.classList.remove('input-error');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.classList.remove('visible');
    }
  }

  function limpiarErrores() {
    desmarcarCampo(inputNombre, errorNombre);
    desmarcarCampo(inputMensaje, errorMensaje);
    feedbackContainer.className = 'form-message-container';
    feedbackContainer.innerHTML = '';
    if (temporizadorMensaje) {
      clearTimeout(temporizadorMensaje);
    }
  }

  function mostrarMensajeAlerta(texto, tipo) {
    feedbackContainer.className = `form-message-container visible ${tipo}`;

    // Iconos SVG para alerta y éxito
    const icono = tipo === 'error'
      ? `<svg class="form-message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg class="form-message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    feedbackContainer.innerHTML = `
      ${icono}
      <div>${texto}</div>
    `;

    // Hacer scroll suave hacia el mensaje de feedback si está fuera de vista
    feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function procesarEnvioExitoso(nombre) {
    // Deshabilitar botón temporalmente para simular envío fluido
    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.style.opacity = '0.7';
      btnEnviar.querySelector('span').textContent = 'Enviando...';
    }

    setTimeout(() => {
      // Mostrar mensaje de confirmación/éxito
      mostrarMensajeAlerta(
        `<strong>¡Mensaje enviado con éxito, ${nombre}!</strong> Hemos recibido tu solicitud. Nuestro equipo en el Barrio El Sucre se comunicará contigo a la brevedad.`,
        'success'
      );

      // Reiniciar formulario
      form.reset();

      // Restaurar botón de envío
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.style.opacity = '1';
        btnEnviar.querySelector('span').textContent = 'Enviar Mensaje';
      }

      // Mensaje de éxito temporal: se oculta automáticamente tras 6 segundos
      temporizadorMensaje = setTimeout(() => {
        feedbackContainer.classList.remove('visible');
      }, 6000);
    }, 450);
  }
}

/* ==========================================================================
   3. Navegación Móvil (Toggle Hamburguesa)
   ========================================================================== */
function initMenuMovil() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const estaActivo = navMenu.classList.toggle('active');
    toggleBtn.setAttribute('aria-expanded', estaActivo ? 'true' : 'false');
  });

  // Cerrar menú al hacer clic en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}
