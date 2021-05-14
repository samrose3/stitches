import { createCss } from '../src/index.js'

describe('Empty Variants', () => {
	test('Empty Variants', () => {
		const { css, getCssString } = createCss()

		css({
			variants: {
				size: {
					xl: {},
				},
				tone: {
					primary: {},
				},
			},
			compoundVariants: [
				{
					tone: 'primary',
					size: 'xl',
				},
			],
		})({
			tone: 'primary',
			size: { '@initial': 'xl' },
		})

		expect(getCssString()).toBe('')
	})

	test('Empty Variants', () => {
		const { css, getCssString } = createCss()

		css({
			variants: {
				size: {
					xl: {},
				},
				tone: {
					primary: {},
				},
			},
			compoundVariants: [
				{
					tone: 'primary',
					size: 'xl',
					css: { fontSize: '24px', color: 'black' },
				},
			],
		})({
			tone: 'primary',
			size: { '@initial': 'xl' },
		})

		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vPJLV-size-xl-ijGiuY c-PJLV-vPJLV-tone-primary c-PJLV-clhHHWD-ijGiuY}@media{` +
				`@media all{.c-PJLV-clhHHWD-ijGiuY{font-size:24px;color:black}}` +
			`}`
		)
	})
}) // prettier-ignore
