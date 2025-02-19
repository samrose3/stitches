import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { createCss } from '../src/index.js'

let RenderOf = (...typeThenPropsThenChildren) => {
	let Rendered

	void renderer.act(() => {
		Rendered = renderer.create(React.createElement(...typeThenPropsThenChildren))
	})

	return Rendered.toJSON()
}

describe('Issue #450', () => {
	test('Compound variants apply to composed components (basic)', () => {
		const { styled, getCssString } = createCss()

		const Happy = styled('div', {
			'--is-happy': true,

			variants: {
				fulfilled: {
					positively: {
						'--is-fulfilled-positively': true,
					},
				},
				satisfied: {
					definitely: {
						'--is-satisfied-definitely': true,
					},
				},
			},

			defaultVariants: {
				fulfilled: 'positively',
				satisfied: 'definitely',
			},
		})

		expect(
			RenderOf(Happy, null).props.className
		).toBe(
			`c-fEpFmO c-fEpFmO-cfZmSQ-variant c-fEpFmO-FgYNE-variant`
		)

		expect(
			getCssString()
		).toBe(
			// composition styles
			`--stitches{--:2 c-fEpFmO}@media{` +
				`.c-fEpFmO{--is-happy:true}` +
			`}` +
			// variant styles
			`--stitches{--:3 c-fEpFmO-cfZmSQ-variant c-fEpFmO-FgYNE-variant}@media{` +
				`.c-fEpFmO-cfZmSQ-variant{--is-fulfilled-positively:true}` +
				`.c-fEpFmO-FgYNE-variant{--is-satisfied-definitely:true}` +
			`}`
		)
	})

	test('Compound variants apply to composed components (complex)', () => {
		const { styled } = createCss()

		const Tile = styled('div', {
			'--tile': 1,

			'variants': {
				appearance: {
					primary: {},
					secondary: { '--appearance': 'secondary' },
				},
				color: {
					red: {},
					purple: { '--color': 'purple' },
					lightBlue: { '--color': 'lightBlue' },
				},
			},

			'compoundVariants': [
				{
					appearance: 'secondary',
					color: 'lightBlue',
					css: {
						'--compound': 'appearance secondary / color lightBlue',
					},
				},
			],

			'defaultVariants': {
				appearance: 'primary',
				color: 'red',
			},
		})

		const RoundedTile = styled(Tile, {
			'--rounded-tile': 1,

			'defaultVariants': {
				appearance: 'secondary',
				color: 'lightBlue',
			},
		})

		let RenderOf = (...typeThenPropsThenChildren) => {
			let Rendered

			void renderer.act(() => {
				Rendered = renderer.create(React.createElement(...typeThenPropsThenChildren))
			})

			return Rendered.toJSON()
		}

		const tileComponentClass = `c-kTjQBa`
		const roundedTileComponentClass = `c-gLsErE`

		const variantLightBlueClass = `c-kTjQBa-ilDyRi-variant`
		const variantAppearanceSecondaryClass = `c-kTjQBa-cOChOn-variant`
		const variantCompoundClass = `c-kTjQBa-gYqlvA-variant`

		// Normal variants

		// renders { appearance: "primary"; color: "red" }, neither empty variant will render
		expect(RenderOf(Tile).props.className).toBe(tileComponentClass)

		// renders { appearance: "primary"; color: "lightBlue" }, the { color: "lightBlue" } variant will render
		expect(RenderOf(Tile, { color: 'lightBlue' }).props.className).toBe(`${tileComponentClass} ${variantLightBlueClass}`)

		// Compound variants

		// renders { appearance: "secondary"; color: "lightBlue" }, the { appearance: "secondary" } variant will render
		expect(RenderOf(Tile, { appearance: 'secondary' }).props.className).toBe(`${tileComponentClass} ${variantAppearanceSecondaryClass}`)

		// renders { appearance: "secondary"; color: "lightBlue" }, the { appearance: "secondary" }, { color: "lightBlue" } variants will render
		expect(RenderOf(Tile, { appearance: 'secondary', color: 'lightBlue' }).props.className).toBe(`${tileComponentClass} ${variantAppearanceSecondaryClass} ${variantLightBlueClass} ${variantCompoundClass}`)

		// Restyled compound variants (compound is activated implicitly by defaultVariants)

		// appearance: primary, color: red, +
		expect(
			RenderOf(RoundedTile).props.className
		).toBe(
			`${tileComponentClass} ${variantAppearanceSecondaryClass} ${variantLightBlueClass} ${variantCompoundClass} ${roundedTileComponentClass}`
		)

		// Restyled compound variants (compound is activated explicitly by props)

		// appearance: secondary, compound * 2, +
		expect(
			RenderOf(RoundedTile, { appearance: 'secondary', color: 'lightBlue' }).props.className
		).toBe(
			`${tileComponentClass} ${variantAppearanceSecondaryClass} ${variantLightBlueClass} ${variantCompoundClass} ${roundedTileComponentClass}`
		)
	})
}) // prettier-ignore
