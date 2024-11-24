/* global localStorage, HTMLElement, customElements  */
document.addEventListener('DOMContentLoaded', function () {
  const scrollY = localStorage.getItem('scrollY')
  if (scrollY) window.scrollTo(0, scrollY)
})

window.onbeforeunload = function () {
  localStorage.setItem('scrollY', window.scrollY)
}

class BlockForm extends HTMLElement {
  constructor () {
    super()

    const textForm = this.querySelector('#block-create')
    this.textForm = {
      el: textForm,
      action: textForm.getAttribute('action'),
      typeSelect: textForm.querySelector('select'),
      fieldsets: () => textForm.querySelectorAll('fieldset'),
    }

    const dataForm = this.querySelector('#block-create-file')
    this.dataForm = {
      el: dataForm,
      action: dataForm.getAttribute('action'),
      enctype: dataForm.getAttribute('enctype'),
      options: dataForm.querySelector('option'),
      fieldset: dataForm.querySelector('fieldset'),
    }

    this.textForm.typeSelect.addEventListener(
      'change',
      this.handleTypeSelect.bind(this)
    )
  }

  connectedCallback () {
    const { textForm, dataForm } = this
    const { typeSelect } = textForm
    const { value } = typeSelect.options[typeSelect.selectedIndex]

    typeSelect.append(dataForm.options)
    typeSelect.value = value

    Array.from(this.textForm.fieldsets())
      .findLast(el => el.after(this.dataForm.fieldset))

    this.handleTypeSelect()

    dataForm.el.remove()
  }

  handleTypeSelect () {
    const { textForm, dataForm } = this
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
    }
  }
}

customElements.define('block-form', BlockForm)
