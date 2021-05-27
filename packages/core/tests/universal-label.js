import { createCss } from '../src/index.js'

describe('Label', () => {
	test('Authors can define a label applied to components', () => {
		const { css, toString } = createCss()

		expect(toString()).toBe('')

		const component = css({ label: 'RedText', color: 'red' })

		expect(toString()).toBe('')

		component.toString()

		expect(toString()).toBe('.sx3ye05-RedText{color:red;}')
	})
})
