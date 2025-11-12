// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el formulario
    const form = document.getElementById('contactForm');
    
    // Objeto con mensajes de error personalizados
    const errorMessages = {
        name: {
            valueMissing: 'Por favor ingresa tu nombre',
            patternMismatch: 'El nombre solo debe contener letras y espacios',
            tooShort: 'El nombre debe tener al menos 3 caracteres',
            tooLong: 'El nombre no debe exceder los 50 caracteres'
        },
        direccion: {
            valueMissing: 'Por favor ingresa tu dirección',
            patternMismatch: 'La dirección ingresada no es válida',
            tooShort: 'La dirección debe tener al menos 3 caracteres',
            tooLong: 'La dirección no debe exceder los 150 caracteres'
        },
        email: {
            valueMissing: 'Por favor ingresa tu correo electrónico',
            typeMismatch: 'Por favor ingresa un correo electrónico válido'
        }
    };

    // Función para mostrar errores
    function showError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        const errorDiv = document.getElementById(`${input.id}Error`);
        if (errorDiv) {
            errorDiv.textContent = message;
        }
    }

    // Función para mostrar éxito
    function showSuccess(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    // Validar campo individual
    function validateField(input) {
        const validity = input.validity;
        
        if (validity.valid) {
            showSuccess(input);
            return true;
        }

        // Obtener mensaje de error correspondiente
        let message = '';
        const messages = errorMessages[input.id];
        
        for (const key in validity) {
            if (validity[key] && messages && messages[key]) {
                message = messages[key];
                break;
            }
        }

        showError(input, message);
        return false;
    }

    // Validar todos los campos cuando se envía el formulario
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const inputs = form.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Mostrar mensaje de éxito
            const formAlert = document.getElementById('formAlert');
            formAlert.classList.remove('d-none');
            
            // Limpiar formulario
            form.reset();
            
            // Remover clases de validación
            inputs.forEach(input => {
                input.classList.remove('is-valid');
            });

            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                formAlert.classList.add('d-none');
            }, 5000);
        }
    });

    // Validar campos mientras el usuario escribe
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });
});