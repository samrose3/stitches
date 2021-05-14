import { createCss } from '../src/index.js'

describe('Variants', () => {
	const componentConfig = {
		variants: {
			color: {
				blue: {
					backgroundColor: 'dodgerblue',
					color: 'white',
				},
				red: {
					backgroundColor: 'tomato',
					color: 'white',
				},
			},
			size: {
				small: {
					fontSize: '16px',
				},
				large: {
					fontSize: '24px',
				},
			},
			level: {
				1: {
					padding: '0.5em',
				},
				2: {
					padding: '1em',
				},
			},
		},
		compoundVariants: [
			{
				size: 'small',
				color: 'blue',
				css: {
					transform: 'scale(1.2)',
				},
			},
		],
	}

	test('Renders a component without any initial styles', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component()

		expect(expression.className).toBe('c-PJLV')
		expect(getCssString()).toBe('')
	})

	test('Renders a component with 1 matching variant', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression1 = component({ size: 'small' })

		const expression1CssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'

		expect(expression1.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{${expression1CssText}}`)

		const expression2 = component({ color: 'blue' })

		const expression2CssText = '.c-PJLV-vkaCQqN-color-blue{background-color:dodgerblue;color:white}'

		expect(expression2.className).toBe('c-PJLV c-PJLV-vkaCQqN-color-blue')
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-vkaCQqN-color-blue}@media{${expression1CssText + expression2CssText}}`)
	})

	test('Renders a component with 2 matching variants', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ size: 'small', level: 1 })

		expect(expression.className).toBe('c-PJLV c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1')

		const expressionSizeSmallCssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'
		const expressionLevel1CssText = '.c-PJLV-viRwLiB-level-1{padding:0.5em}'

		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1}@media{${expressionSizeSmallCssText + expressionLevel1CssText}}`)
	})

	test('Renders a component with a 2 matching variants and 1 matching compound', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ size: 'small', color: 'blue' })

		const expressionColorBlueCssText = '.c-PJLV-vkaCQqN-color-blue{background-color:dodgerblue;color:white}'
		const expressionSizeSmallCssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'
		const expressionCompoundCssText = '.c-PJLV-ccChFtv{transform:scale(1.2)}'

		expect(expression.className).toBe(`c-PJLV c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv`)
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv}@media{${expressionColorBlueCssText + expressionSizeSmallCssText + expressionCompoundCssText}}`)
	})
})

describe('Variants with defaults', () => {
	const componentConfig = {
		variants: {
			color: {
				blue: {
					backgroundColor: 'dodgerblue',
					color: 'white',
				},
				red: {
					backgroundColor: 'tomato',
					color: 'white',
				},
			},
			size: {
				small: {
					fontSize: '16px',
				},
				large: {
					fontSize: '24px',
				},
			},
			level: {
				1: {
					padding: '0.5em',
				},
				2: {
					padding: '1em',
				},
			},
		},
		compoundVariants: [
			{
				size: 'small',
				color: 'blue',
				css: {
					transform: 'scale(1.2)',
				},
			},
		],
		defaultVariants: {
			size: 'small',
		},
	}

	test('Renders a component with the default variant applied', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component()

		expect(expression.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}`)
	})

	test('Renders a component with the default variant explicitly applied', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ size: 'small' })

		expect(expression.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}`)
	})

	test('Renders a component with the non-default variant explicitly applied', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ size: 'large' })

		expect(expression.className).toBe('c-PJLV c-PJLV-vhsYHIj-size-large')
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vhsYHIj-size-large}@media{.c-PJLV-vhsYHIj-size-large{font-size:24px}}`)
	})

	test('Renders a component with the default variant applied and a different variant explicitly applied', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ level: 1 })

		expect(expression.className).toBe('c-PJLV c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1')
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1}@media{` +
				// implicit size:small
				`.c-PJLV-vGaggi-size-small{font-size:16px}` +
				// explicit level:1
				`.c-PJLV-viRwLiB-level-1{padding:0.5em}` +
				`}`,
		)
	})

	test('Renders a component with the default variant applied, a different variant explicitly applied, and a compound applied', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const expression = component({ color: 'blue' })

		expect(expression.className).toBe('c-PJLV c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv')
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv}@media{` +
				// explicit color:blue
				`.c-PJLV-vkaCQqN-color-blue{background-color:dodgerblue;color:white}` +
				// implicit size:small
				`.c-PJLV-vGaggi-size-small{font-size:16px}` +
				// compound color:blue + size:small
				`.c-PJLV-ccChFtv{transform:scale(1.2)}` +
				`}`,
		)
	})

	test('Returns a component class without the default variant applied when stringified', () => {
		const { css, getCssString } = createCss()
		const component = css(componentConfig)
		const className = `${component}`

		expect(className).toBe('c-PJLV')
		expect(getCssString()).toBe('--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}')
	})
})

describe('Conditional variants', () => {
	const config = {
		media: {
			bp1: '(max-width: 767px)',
			bp2: '(min-width: 768px)',
		},
	}

	/** Component with variants and compound variants */
	const componentConfig = {
		variants: {
			color: {
				blue: {
					backgroundColor: 'dodgerblue',
					color: 'white',
				},
				red: {
					backgroundColor: 'tomato',
					color: 'white',
				},
			},
			size: {
				small: {
					fontSize: '16px',
				},
				large: {
					fontSize: '24px',
				},
			},
			level: {
				1: {
					padding: '0.5em',
				},
				2: {
					padding: '1em',
				},
			},
		},
		compoundVariants: [
			{
				size: 'small',
				color: 'blue',
				css: {
					transform: 'scale(1.2)',
				},
			},
		],
	}

	test('Renders a component with no variant applied', () => {
		const { css, getCssString } = createCss(config)
		const component = css(componentConfig)
		const componentClassName = 'c-PJLV'

		expect(component().className).toBe(componentClassName)
		expect(getCssString()).toBe('')
	})

	test('Renders a component with one variant applied', () => {
		const { css, getCssString } = createCss(config)
		const component = css(componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallClassName = `${componentClassName}-vGaggi-size-small`
		const componentSmallCssText = `.${componentSmallClassName}{font-size:16px}`

		expect(component({ size: 'small' }).className).toBe([componentClassName, componentSmallClassName].join(' '))
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{${componentSmallCssText}}`)
	})

	test('Renders a component with one conditional variant on one breakpoint applied', () => {
		const { css, getCssString } = createCss(config)
		const component = css(componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`

		expect(component({ size: { '@bp1': 'small' } }).className).toBe([componentClassName, componentSmallBp1ClassName].join(' '))
		expect(getCssString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf}@media{${componentSmallBp1CssText}}`)
	})

	test('Renders a component with one conditional variant on two breakpoints applied', () => {
		const { css, getCssString } = createCss(config)
		const component = css(componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentLargeBp2ClassName = `${componentClassName}-vhsYHIj-size-large-iRyZGy`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`
		const componentLargeBp2CssText = `@media (min-width: 768px){.${componentLargeBp2ClassName}{font-size:24px}}`

		expect(component({ size: { '@bp1': 'small', '@bp2': 'large' } }).className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				componentSmallBp1CssText +
				componentLargeBp2CssText +
			`}`
		)
	})

	test('Renders a component with a conditional variant repeatedly', () => {
		const { css, getCssString } = createCss(config)
		const component = css(componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentLargeBp2ClassName = `${componentClassName}-vhsYHIj-size-large-iRyZGy`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`
		const componentLargeBp2CssText = `@media (min-width: 768px){.${componentLargeBp2ClassName}{font-size:24px}}`

		expect(component({ size: { '@bp1': 'small', '@bp2': 'large' } }).className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				componentSmallBp1CssText +
				componentLargeBp2CssText +
			`}`
		)

		expect(component({ size: { '@bp1': 'small', '@bp2': 'large' } }).className).toBe(`c-PJLV c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy`)
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				`@media (max-width: 767px){.c-PJLV-vGaggi-size-small-drhMrf{font-size:16px}}` +
				`@media (min-width: 768px){.c-PJLV-vhsYHIj-size-large-iRyZGy{font-size:24px}}` +
			`}`
		)

		expect(component({ size: { '@bp1': 'small', '@bp2': 'large' } }).className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				componentSmallBp1CssText +
				componentLargeBp2CssText +
			`}`
		)
	})

	test('Renders a component with a conditional inline variant repeatedly', () => {
		{
			const { css, getCssString } = createCss(config)
			const component = css({
				variants: {
					size: {
						small: {
							fontSize: '16px',
						},
						large: {
							fontSize: '24px',
						},
					},
				},
			})

			expect(
				component({
					size: {
						'@media (width < 768px)': 'small',
						'@media (width >= 768px)': 'large',
					},
				}).className,
			).toBe('c-PJLV c-PJLV-vGaggi-size-small-dxHMvP c-PJLV-vhsYHIj-size-large-hyXjZM')

			expect(getCssString()).toBe(
				`--stitches{--:3 c-PJLV-vGaggi-size-small-dxHMvP c-PJLV-vhsYHIj-size-large-hyXjZM}@media{` +
					`@media (max-width:767.9375px){.c-PJLV-vGaggi-size-small-dxHMvP{font-size:16px}}` +
					`@media (min-width:768px){.c-PJLV-vhsYHIj-size-large-hyXjZM{font-size:24px}}` +
				`}`
			)
		}

		{
			const { css, getCssString } = createCss(config)
			const component = css({
				variants: {
					size: {
						large: {
							fontSize: '24px',
						},
						small: {
							fontSize: '16px',
						},
					},
				},
			})

			expect(
				component({
					size: {
						'@media (width < 768px)': 'small',
						'@media (width >= 768px)': 'large',
					},
				}).className,
			).toBe('c-PJLV c-PJLV-vhsYHIj-size-large-hyXjZM c-PJLV-vGaggi-size-small-dxHMvP')

			expect(getCssString()).toBe(
				`--stitches{--:3 c-PJLV-vhsYHIj-size-large-hyXjZM c-PJLV-vGaggi-size-small-dxHMvP}@media{` +
					`@media (min-width:768px){.c-PJLV-vhsYHIj-size-large-hyXjZM{font-size:24px}}` +
					`@media (max-width:767.9375px){.c-PJLV-vGaggi-size-small-dxHMvP{font-size:16px}}` +
				`}`
			)
		}
	})
}) // prettier-ignore
