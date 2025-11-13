
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;

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

    // claves de valididad a comprobar en orden
    const validityKeys = [
        'valueMissing',
        'typeMismatch',
        'patternMismatch',
        'tooShort',
        'tooLong',
        'rangeUnderflow',
        'rangeOverflow',
        'stepMismatch',
        'badInput',
        'customError'
    ];

    function showError(input, message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        const errorDiv = document.getElementById(`${input.id}Error`);
        if (errorDiv) {
            errorDiv.textContent = message;
            // Bootstrap oculta .invalid-feedback por defecto; forzamos su visualización
            errorDiv.classList.add('d-block');
        }
    }

    function hideError(input) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        const errorDiv = document.getElementById(`${input.id}Error`);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('d-block');
        }
    }

    function validateField(input) {
        const validity = input.validity;
        if (validity.valid) {
            hideError(input);
            return true;
        }

        // buscar primer error relevante y mensaje personalizado si existe
        let message = '';
        const messages = errorMessages[input.id];
        for (const key of validityKeys) {
            if (validity[key]) {
                message = (messages && messages[key]) ? messages[key] : input.validationMessage || 'Campo inválido';
                break;
            }
        }

        showError(input, message);
        return false;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const inputs = Array.from(form.querySelectorAll('input'));
        let isValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        if (!isValid) {
            // enfocar el primer campo inválido
            firstInvalid && firstInvalid.focus();
            return;
        }

        // éxito: mostrar alerta y limpiar
        const formAlert = document.getElementById('formAlert');
        if (formAlert) {
            formAlert.textContent = '¡En 48hs recibirás tu pedido!';
            formAlert.classList.remove('d-none');
            formAlert.style.fontSize = '1.25rem';
            formAlert.style.fontWeight = '600';
        }

        form.reset();
        inputs.forEach(i => {
            i.classList.remove('is-valid');
            const err = document.getElementById(`${i.id}Error`);
            if (err) { err.textContent = ''; err.classList.remove('d-block'); }
        });

        setTimeout(() => {
            if (formAlert) formAlert.classList.add('d-none');
        }, 5000);
    });

    // validación en tiempo real
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });
});