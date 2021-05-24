import { createCss } from '../src/index.js'

describe('emerson', () => {
	test('lake', () => {
		const { styled, toString } = createCss({
			utils: {
				px: () => (value) => ({
					paddingLeft: value,
					paddingRight: value,
				}),
			},
		})

		const component = styled('span', {
			variants: {
				size: {
					'1': {
						px: '$1',
					},
					'2': {
						px: '$2',
					},
				},
			},
		}) // prettier-ignore

		const cssText = '--stitches{--:3 c-PJLV-vefCiES-size-1}@media{.c-PJLV-vefCiES-size-1{padding-left:var(--space-1);padding-right:var(--space-1)}}'

		component.render({ size: '1' })

		expect(toString()).toBe(cssText)

		component.render({ size: '1' })

		expect(toString()).toBe(cssText)

		component.render({ size: '1' })

		expect(toString()).toBe(cssText)
	})
})
