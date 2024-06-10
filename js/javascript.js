function responsiveMenu() {
    var x = document.getElementById("menu");
    if (x.className === "menu") {
      x.className += " responsive";
    } else {
      x.className = "menu";
    }
  }


  function showHourRate() {
    const form = document.getElementById('contact-form');
    const hourlyRateDiv = document.getElementById('hourlyRate');
    const hourlyRateInput = hourlyRateDiv.querySelector('input[name="rate"]');

    form.addEventListener('change', function(event) {
        const selectedOption = event.target.value;

        if (selectedOption === 'hiring') {
            hourlyRateDiv.style.display = 'block';
            hourlyRateInput.setAttribute('required', 'true');
        } else {
            hourlyRateDiv.style.display = 'none';
            hourlyRateInput.removeAttribute('required');
        }
    });
  }
    

