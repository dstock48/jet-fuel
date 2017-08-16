$(document).ready(function() {
    fetch('api/v1/links')
      .then(data => data.json())
      .then(data => console.log(data))

    fetch('api/v1/folders')
      .then(data => data.json())
      .then(folders => {
        folders.forEach(folder => {
          $('.folder-select').append(`<option value="${folder.id}">${folder.folder_name}</option>`)
        })
      })
});

$('.submit-btn').on('click', function(e) {
  e.preventDefault()

  const urlInput = $('.url-input');
  const folderNameInput = $('.folder-name-input');
  const urlDescInput = $('.url-description');

  fetch('api/v1/links', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      long_url: urlInput.val(),
      title: urlDescInput.val()
    })
  })

  fetch('api/v1/folders', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      folder_name: folderNameInput.val()
    })
  })

  urlInput.val('');
  urlDescInput.val('');
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
