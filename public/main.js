// Event Listeners
/////////////////////////////////////////////////////////////////
populateFoldersAndLinks('asc');
$('.folder-name-input-container').hide()

$('#sort-order').on('change', function(e) {
  const sortOrder = e.target.value
  $('.folder-select').html(
    `<option value="choose-folder" selected disabled>Choose a folder...</option>
     <option value="new-folder">New Folder</option>`
  )
  $('.links-containers').empty()
  populateFoldersAndLinks(sortOrder);
})

$('.folder-select').on('change', (e) => {
  if (e.target.value === 'new-folder') {
    $('.folder-name-input-container').show()
  } else {
    $('.folder-name-input-container').hide()
  }
})

$('.shortened-url-container').on('click', '.shortened-url', function(e) {
  copyToClipboard('.shortened-url')
  $('.shortened-url-container').append(
    `<p class="copy-msg">Shrt url copied to clipboard</p>`
  )
})

$('.submit-btn').on('click', function(e) {
  e.preventDefault()

  const urlInput = $('.url-input');
  const folderNameInput = $('.folder-name-input');
  const urlDescInput = $('.url-description');

  let selectedFolderId = $('.folder-select');

  const addLink = (url, title, folderID) => {
    fetch('api/v1/links', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        long_url: url,
        title: title,
        folder_id: folderID
      })
    })
    .then(data => data.json())
    .then(link => {
      appendShortenedUrl(link)
      appendLinkCard(link)
    })
    .catch(err => console.log(err))
  }

  if (selectedFolderId.val() !== 'new-folder') {
    addLink(urlInput.val(), urlDescInput.val(), selectedFolderId.val())
    urlInput.val('');
    urlDescInput.val('');
    $('.folder-select').val('choose-folder')
  } else {
    fetch('api/v1/folders', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        folder_name: folderNameInput.val()
      })
    })
    .then(data => data.json())
    .then(folder => {
      if (!folder.id) {
        return
      }
      appendFolderOption(folder)
      appendLinkContainer(folder)
      addLink(urlInput.val(), urlDescInput.val(), folder.id)
    })
    .then(() => {
      urlInput.val('');
      urlDescInput.val('');
      folderNameInput.val('');
      $('.folder-name-input-container').hide()
      $('.folder-select').val('choose-folder')
    })
    .catch(err => console.log(err))

  }

})

$('.links-containers').on('click', '.folder-name', function(e) {

  const folderIcon = $(this).find($('.fa'))

  if (folderIcon.hasClass('fa-folder')) {
    folderIcon.replaceWith(
      `<i class="fa fa-folder-open" aria-hidden="true"></i>`
    )
  } else {
    folderIcon.replaceWith(
      `<i class="fa fa-folder" aria-hidden="true"></i>`
    )
  }

  $(this).siblings().toggleClass('hidden')
})



// Functions
/////////////////////////////////////////////////////////////////
function appendFolderOption(folder) {
  $('.folder-select').append(
    `<option value="${folder.id}">${folder.folder_name}</option>`
  )
}

function appendLinkContainer(folder) {
  $('.links-containers').append(
    `<div class="container container-${folder.id}">
      <h3 class="folder-name"><i class="fa fa-folder-open" aria-hidden="true"></i>${folder.folder_name}</h3>

    </div>`
  )
}

function appendLinkCard(link) {
  $(`.container-${link.folder_id}`).append(
    `<a class="link-card" target="_blank" href="/shrt/${link.short_url}">
      <div>
        <p class="link-date">Date Added:
          <i class="fa fa-calendar" aria-hidden="true"></i>   ${moment(link.created_at).format(`M/DD/YY`)} <i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(link.created_at).format(`h:mma`)}
        </p>
        <p class="link-title">${link.title}</p>
        <p class="link-path">${window.origin}/shrt/${link.short_url}</p>
      </div>
    </a>`
  )
}

function appendShortenedUrl(link) {
  $('.shortened-url-container').empty()
  $('.shortened-url-container').append(
    `<p class="shortened-url-label">SHRTND URL</p>
     <p class="shortened-url">${window.origin}/shrt/${link.short_url}</p>`
  )
}

function populateFoldersAndLinks(sortOrder) {
  fetch('api/v1/folders')
    .then(data => data.json())
    .then(folders => {
      folders.forEach(folder => {
        appendFolderOption(folder)
        appendLinkContainer(folder)
      })
    })
    .catch(err => console.log(err))

  fetch('api/v1/links')
    .then(data => data.json())
    .then(links => {
      if (sortOrder === 'dec') {
        for (let i = links.length - 1; i >= 0; i--) {
          appendLinkCard(links[i])
        }
      } else if(sortOrder === 'asc') {
        for (let i = 0; i < links.length; i++) {
          appendLinkCard(links[i])
        }
      }
    })
    .catch(err => console.log(err))
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}



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
