/* global localStorage, HTMLElement, customElements  */

//
// Scroll Position
//

document.addEventListener('DOMContentLoaded', function () {
  const scrollY = localStorage.getItem('scrollY')
  if (scrollY) window.scrollTo(0, scrollY)
})

window.onbeforeunload = function () {
  localStorage.setItem('scrollY', window.scrollY)
}

//
// Add Edit Button to Block Form Controls
//

const blockFormControls = document.querySelectorAll('details > [role=group]')
for (const controlContainer of blockFormControls) {
  const form = controlContainer.closest('details').querySelector('form')
  const output = controlContainer.closest('details').querySelector('.block-output')

  if (form) {
    const editButton = document.createElement('button')
    editButton.classList.add('outline', 'contrast')
    editButton.textContent = 'Edit'
    form.classList.toggle('hidden')

    editButton.addEventListener('click', () => {
      form.classList.toggle('hidden')
      output.classList.toggle('hidden')

      if (form.classList.contains('hidden')) {
        editButton.textContent = 'Edit'
      } else {
        editButton.textContent = 'Cancel'
      }
    })

    controlContainer.prepend(editButton)
  }
}

//
// Modal create form
//

const templateClone = document.querySelector('#add-block-template').content.cloneNode(true);
const dialog = templateClone.querySelector('dialog')
const createBlockForm = document.querySelector('block-form')
const openCreateModalButton = document.createElement('button')
openCreateModalButton.textContent = 'Add Block'
openCreateModalButton.addEventListener('click', () => {
  dialog.showModal()
})
createBlockForm.after(dialog)
dialog.append(createBlockForm)
dialog.addEventListener('close', function () {
  createBlockForm.removeAttribute('order')
})

//
// Position Add Block Buttons
//

const blocks = document.querySelectorAll('article:has(details)')
if (!blocks.length) {
  const openCreateModalButton = document.createElement('button')
  openCreateModalButton.textContent = 'Add Block'
  openCreateModalButton.addEventListener('click', () => {
    dialog.showModal()
  })
  document.querySelector('main').append(openCreateModalButton)
}

for (const block of blocks) {
  const openCreateModalButton = document.createElement('button')
  openCreateModalButton.textContent = 'Add Block'
  openCreateModalButton.addEventListener('click', () => {
    createBlockForm.setAttribute('order', block.getAttribute('order'))
    dialog.showModal()
  })
  block.after(openCreateModalButton)
}

//
// Block Open/Close state
//

for (const block of blocks) {
  block.querySelector('details').addEventListener('toggle', async function () {
    const state = this.hasAttribute('open')
    const { idBlock, idPage } = block.dataset

    try {
      await fetch(`/pages/${idPage}/block/${idBlock}/state?open=${state}`)
    } catch (err) {
      console.log(err)
    }
  })
}

//
// Custom Elements
//

class BlockForm extends HTMLElement {
  static observedAttributes = ['order'];

  constructor () {
    super()

    const textForm = this.querySelector('#block-create')
    this.textForm = {
      el: textForm,
      action: textForm.getAttribute('action'),
      typeSelect: textForm.querySelector('select'),
      fieldsets: () => textForm.querySelectorAll(`fieldset`),
      lastFieldset: () => textForm.querySelector(`fieldset:last-of-type`),
      order: textForm.querySelector('[name=order]'),
    }

    const dataForm = this.querySelector('#block-create-file')
    this.dataForm = {
      el: dataForm,
      action: dataForm.getAttribute('action'),
      enctype: dataForm.getAttribute('enctype'),
      options: dataForm.querySelector('option'),
      fieldset: dataForm.querySelector('fieldset'),
    }

    const linkForm = this.querySelector('#block-create-link')
    this.linkForm = {
      el: linkForm,
      action: linkForm.getAttribute('action'),
      typeSelect: linkForm.querySelector('select'),
      fieldset: linkForm.querySelector('fieldset'),
      options: linkForm.querySelector('option'),
    }

    this.textForm.typeSelect.addEventListener(
      'change',
      this.handleTypeSelect.bind(this)
    )
  }

  connectedCallback () {
    const { textForm, dataForm, linkForm } = this
    const { typeSelect } = textForm
    const { value } = typeSelect.options[typeSelect.selectedIndex]

    typeSelect.append(dataForm.options)
    typeSelect.append(linkForm.options)
    typeSelect.value = value

    this.textForm.lastFieldset()
      .after(this.dataForm.fieldset)

    this.textForm.lastFieldset()
      .after(this.linkForm.fieldset)

    this.handleTypeSelect()

    dataForm.el.remove()
    linkForm.el.remove()
  }

  handleTypeSelect () {
    const { textForm, dataForm, linkForm } = this
    const { typeSelect } = textForm
    const { type } = typeSelect.options[typeSelect.selectedIndex].dataset

    textForm.fieldsets().forEach(
      fieldset => fieldset.setAttribute('disabled', true)
    )

    switch (type) {
      case 'text':
        textForm.el.setAttribute('action', textForm.action)
        textForm.el.removeAttribute('enctype')
        textForm.el.querySelector('[name="text-area"]')
          .removeAttribute('disabled')
        break
      case 'file':
        textForm.el.setAttribute('action', dataForm.action)
        textForm.el.setAttribute('enctype', dataForm.enctype)
        textForm.el.querySelector('[name="file-area"]')
          .removeAttribute('disabled')
        break
      case 'link':
        textForm.el.setAttribute('action', linkForm.action)
        textForm.el.removeAttribute('enctype')
        textForm.el.querySelector('[name="link-area"]')
          .removeAttribute('disabled')
        break
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.textForm.order.removeAttribute('disabled')
    this.textForm.order.value = newValue
  }
}

customElements.define('block-form', BlockForm)
