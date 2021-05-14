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
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render()

		expect(expression.props.className).toBe('c-PJLV')
		expect(toString()).toBe('')
	})

	test('Renders a component with 1 matching variant', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression1 = component.render({ size: 'small' })

		const expression1CssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'

		expect(expression1.props.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{${expression1CssText}}`)

		const expression2 = component.render({ color: 'blue' })

		const expression2CssText = '.c-PJLV-vkaCQqN-color-blue{background-color:dodgerblue;color:white}'

		expect(expression2.props.className).toBe('c-PJLV c-PJLV-vkaCQqN-color-blue')
		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-vkaCQqN-color-blue}@media{${expression1CssText}${expression2CssText}}`)
	})

	test('Renders a component with 2 matching variants', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ size: 'small', level: 1 })

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1')

		const expressionSizeSmallCssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'
		const expressionLevel1CssText = '.c-PJLV-viRwLiB-level-1{padding:0.5em}'

		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1}@media{${expressionSizeSmallCssText}${expressionLevel1CssText}}`)
	})

	test('Renders a component with a 2 matching variants and 1 matching compound', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ size: 'small', color: 'blue' })

		const expressionSizeSmallCssText = '.c-PJLV-vGaggi-size-small{font-size:16px}'
		const expressionColorBlueCssText = '.c-PJLV-vkaCQqN-color-blue{background-color:dodgerblue;color:white}'
		const expressionCompoundCssText = '.c-PJLV-ccChFtv{transform:scale(1.2)}'

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv')
		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv}@media{${expressionColorBlueCssText}${expressionSizeSmallCssText}${expressionCompoundCssText}}`)
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
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render()

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(toString()).toBe('--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}')
	})

	test('Renders a component with the default variant explicitly applied', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ size: 'small' })

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vGaggi-size-small')
		expect(toString()).toBe('--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}')
	})

	test('Renders a component with the non-default variant explicitly applied', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ size: 'large' })

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vhsYHIj-size-large')
		expect(toString()).toBe('--stitches{--:3 c-PJLV-vhsYHIj-size-large}@media{.c-PJLV-vhsYHIj-size-large{font-size:24px}}')
	})

	test('Renders a component with the default variant applied and a different variant explicitly applied', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ level: 1 })

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1')
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small c-PJLV-viRwLiB-level-1}@media{` +
				// implicit size:small
				`.c-PJLV-vGaggi-size-small{font-size:16px}` +
				// explicit level:1
				`.c-PJLV-viRwLiB-level-1{padding:0.5em}` +
				`}`,
		)
	})

	test('Renders a component with the default variant applied, a different variant explicitly applied, and a compound applied', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const expression = component.render({ color: 'blue' })

		expect(expression.props.className).toBe('c-PJLV c-PJLV-vkaCQqN-color-blue c-PJLV-vGaggi-size-small c-PJLV-ccChFtv')
		expect(toString()).toBe(
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

	test('Returns a component selector without the default variant applied when toString is used', () => {
		const { styled, toString } = createCss()
		const component = styled('div', componentConfig)
		const selector = component.toString()

		expect(selector).toBe('.c-PJLV')
		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{.c-PJLV-vGaggi-size-small{font-size:16px}}`)
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
		const { styled, toString } = createCss(config)
		const component = styled('div', componentConfig)
		const componentClassName = 'c-PJLV'

		expect(component.render().props.className).toBe(componentClassName)
		expect(toString()).toBe('')
	})

	test('Renders a component with one variant applied', () => {
		const { styled, toString } = createCss(config)
		const component = styled('div', componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallClassName = `${componentClassName}-vGaggi-size-small`
		const componentSmallCssText = `.${componentSmallClassName}{font-size:16px}`

		expect(component.render({ size: 'small' }).props.className).toBe([componentClassName, componentSmallClassName].join(' '))
		expect(toString()).toBe(`--stitches{--:3 c-PJLV-vGaggi-size-small}@media{${componentSmallCssText}}`)
	})

	test('Renders a component with one conditional variant on one breakpoint applied', () => {
		const { styled, toString } = createCss(config)
		const component = styled('div', componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`

		expect(component.render({ size: { '@bp1': 'small' } }).props.className).toBe([componentClassName, componentSmallBp1ClassName].join(' '))
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf}@media{` +
				componentSmallBp1CssText +
			`}`
		)
	})

	test('Renders a component with one conditional variant on two breakpoints applied', () => {
		const { styled, toString } = createCss(config)
		const component = styled('div', componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentLargeBp2ClassName = `${componentClassName}-vhsYHIj-size-large-iRyZGy`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`
		const componentLargeBp2CssText = `@media (min-width: 768px){.${componentLargeBp2ClassName}{font-size:24px}}`

		expect(component.render({ size: { '@bp1': 'small', '@bp2': 'large' } }).props.className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
			componentSmallBp1CssText +
			componentLargeBp2CssText +
			`}`
		)
	})

	test('Renders a component with a conditional variant repeatedly', () => {
		const { styled, toString } = createCss(config)
		const component = styled('div', componentConfig)
		const componentClassName = `c-PJLV`
		const componentSmallBp1ClassName = `${componentClassName}-vGaggi-size-small-drhMrf`
		const componentLargeBp2ClassName = `${componentClassName}-vhsYHIj-size-large-iRyZGy`
		const componentSmallBp1CssText = `@media (max-width: 767px){.${componentSmallBp1ClassName}{font-size:16px}}`
		const componentLargeBp2CssText = `@media (min-width: 768px){.c-PJLV-vhsYHIj-size-large-iRyZGy{font-size:24px}}`

		expect(component.render({ size: { '@bp1': 'small', '@bp2': 'large' } }).props.className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				componentSmallBp1CssText +
				componentLargeBp2CssText +
			`}`
		)

		expect(component.render({ size: { '@bp1': 'small', '@bp2': 'large' } }).props.className).toBe([componentClassName, componentSmallBp1ClassName, componentLargeBp2ClassName].join(' '))
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				`@media (max-width: 767px){.c-PJLV-vGaggi-size-small-drhMrf{font-size:16px}}` +
				`@media (min-width: 768px){.c-PJLV-vhsYHIj-size-large-iRyZGy{font-size:24px}}` +
			`}`
		)

		expect(component.render({ size: { '@bp1': 'small', '@bp2': 'large' } }).props.className).toBe(`c-PJLV c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy`)
		expect(toString()).toBe(
			`--stitches{--:3 c-PJLV-vGaggi-size-small-drhMrf c-PJLV-vhsYHIj-size-large-iRyZGy}@media{` +
				`@media (max-width: 767px){.c-PJLV-vGaggi-size-small-drhMrf{font-size:16px}}` +
				`@media (min-width: 768px){.c-PJLV-vhsYHIj-size-large-iRyZGy{font-size:24px}}` +
			`}`
		)
	})
}) // prettier-ignore
