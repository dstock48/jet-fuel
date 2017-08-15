const submitBtn = $('.submit-btn')
const urlInput = $('.url-input')

submitBtn.on('click', function(e) {
  e.preventDefault()
  console.log(urlInput.val())
  urlInput.val('')
})

urlInput.on('input', function(e) {
  if (e.target.value === '') {
    disableButton(submitBtn)
  } else {
    enableButton(submitBtn)
  }
})

disableButton(submitBtn)

function enableButton(btnName) {
  btnName.prop("disabled",false)
}

function disableButton(btnName) {
  btnName.prop("disabled",true)
}
