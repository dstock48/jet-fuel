const submitBtn = $('.submit-btn')
const urlInput = $('.url-input')

// disableButton(submitBtn)

$(document).ready(function() {
    fetch('api/v1/urls')
      .then(data => data.json())
      .then(data => console.log(data))
});

submitBtn.on('click', function(e) {
  e.preventDefault()
  console.log(urlInput.val())

  fetch('api/v1/urls', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      longUrl: urlInput.val()
    })
  })

  urlInput.val('')
})

// urlInput.on('input', function(e) {
//   if (e.target.value === '') {
//     disableButton(submitBtn)
//   } else {
//     enableButton(submitBtn)
//   }
// })






function enableButton(btnName) {
  btnName.prop("disabled",false)
}

function disableButton(btnName) {
  btnName.prop("disabled",true)
}
