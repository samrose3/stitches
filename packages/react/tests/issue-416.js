import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { createCss } from '../src/index.js'

describe('Issue #416: Composition versus Descendancy', () => {
	{
		const { styled, getCssString } = createCss()

		const BoxA = styled('main', {
			variants: {
				foo: {
					bar: {
						'--box-a': 'foo-bar',
					},
				},
			},
		})

		const BoxB = styled(BoxA, {
			variants: {
				foo: {
					bar: {
						'--box-b': 'foo-bar',
					},
				},
			},
		})

		const GenY = (props) => {
			return React.createElement(BoxB, props)
		}

		const BoxZ = styled(GenY, {
			variants: {
				foo: {
					bar: {
						'--box-z': 'foo-bar',
					},
				},
			},
		})

		const App = () => {
			return React.createElement(
				'div',
				null,
				// children
				React.createElement(BoxA, { foo: 'bar' }),
				React.createElement(BoxB, { foo: 'bar' }),
				React.createElement(GenY, { foo: 'bar' }),
				React.createElement(BoxZ, { foo: 'bar' }),
			)
		}

		let wrapper

		renderer.act(() => {
			wrapper = renderer.create(React.createElement(App))
		})

		const [boxA, boxB, genY, boxZ] = wrapper.toJSON().children

		const baselineClass = `c-PJLV`
		const variantAClass = `c-PJLV-vkgptgY-foo-bar`
		const variantBClass = `c-PJLV-vcHNUhn-foo-bar`
		const variantZClass = `c-PJLV-vvFFMz-foo-bar`

		test('Box A has an active variant', () => expect(boxA.props.className).toBe(`${baselineClass} ${variantAClass}`))

		test('Box B has an active variant, plus the active variant of Box A', () => expect(boxB.props.className).toBe(`${baselineClass} ${variantAClass} ${variantBClass}`))

		test('Gen Y has no variant, but activates the variants of Box A and Box B', () => expect(genY.props.className).toBe(`${baselineClass} ${variantAClass} ${variantBClass}`))

		test('Box Z has an active variant, but does not activate the variants of Box A or Box B', () => expect(boxZ.props.className).toBe(`${baselineClass} ${variantZClass}`))

		test('All variant CSS is generated', () => expect(getCssString()).toBe(
			`--stitches{--:3 c-PJLV-vkgptgY-foo-bar c-PJLV-vcHNUhn-foo-bar c-PJLV-vvFFMz-foo-bar}@media{` +
				`.c-PJLV-vkgptgY-foo-bar{--box-a:foo-bar}` +
				`.c-PJLV-vcHNUhn-foo-bar{--box-b:foo-bar}` +
				`.c-PJLV-vvFFMz-foo-bar{--box-z:foo-bar}` +
			`}`
		))
	}
}) // prettier-ignore
