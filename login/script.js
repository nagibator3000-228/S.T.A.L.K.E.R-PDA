$(document).ready(() => {
   'use strict';
   if (localStorage.getItem("username") !== null) {
      window.location.href = '../index.html'; 
   }
   (() => {
      const forms = document.querySelectorAll('.needs-validation');

      Array.from(forms).forEach(form => {
         form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
               event.preventDefault();
               event.stopPropagation();

               Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Invalid data',
                  padding: 23,
                  timer: 2 * 1000,
                  width: 300,
                  showConfirmButton: false
               });
            } else {
               event.preventDefault();
               Swal.fire({
                  icon: 'success',
                  title: 'Successfull login',
                  padding: 35,
                  width: 400,
                  timer: 10 * 1000,
                  showConfirmButton: false
               });
               let username = document.getElementById("username").value;
               localStorage.setItem("username", username.trim());
               setTimeout(() => {
                  window.location.href = '../index.html'; 
               }, 700);
            }
            form.classList.add('was-validated');
         }, false);
      });
   })();
});
