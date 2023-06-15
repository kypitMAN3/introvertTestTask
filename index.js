const jsdom = require("jsdom")

const dom = new jsdom.JSDOM(`<!DOCTYPE html>
<body>
<h1 class="heading">
</h1>
</body>
`);

const $ = require("./jquery")(dom.window)

const limit = 25;
let page = 1;
let getContactsListQueryUrl = "/api/v4/contacts";
let postTasksQueryURL = "/api/v4/tasks"

function getContacts() {
    $.ajax({
        url: getContactsListQueryUrl,
        method: 'GET',
        data: {
            limit: limit,
            with: 'leads',
            page: page
        }
    }).done(function(data) {
        if (!!data) {
            const contacts = data
            return contacts
        } else {
            console.log('Контактов нет');
            return false;
        }
    }).fail(function(data) {
        console.log('Что-то пошло не так c получением контактов');
        return false;
    })
    page++;
}

function findContactsWithoutDeals() {
  let contactsWithoutDeals = []
  const contacts = getContacts()
  const contactsParse = JSON.parse(JSON.stringify(contacts))._embedded.contacts

  for (let i = 0; i < limit; i++) {

    if (contactsParse[i] == null) {
      break
    }

    if(contactsParse[i]._embedded.leads.length == 0) {
      contactsWithoutDeals.push(contactsParse[i])
    }
  }

  return contactsWithoutDeals
}

function formRequest() {
  const msg = 'Контак без сделок'
  const contacts = findContactsWithoutDeals()
  const request = []

  for(let i = 0; i < contacts.length; i++) {
    request.push({
      "text": msg,
      "complete_till": 1686866634,
      "entity_id": contacts[i].id
    })
  }
  
  return request
}

function postTasks() {
  const request = formRequest()
  console.log(request)
  $.ajax({
    url: postTasksQueryURL,
    method: 'POST',
    data: request
  }).done(function() {
    console.log('Задачи успешно добавлены')
  }).fail(function() {
    console.log('Что-то пошло не так при отправке задач');
    return false;
  })
}

postTasks()