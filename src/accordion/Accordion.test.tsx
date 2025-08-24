import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from '.'

type RenderAccordionOptions = {
  type?: 'single' | 'multiple'
  items?: {
    trigger: string
    content: string
    header?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  }[]
}

const defaultItems: RenderAccordionOptions['items'] = [
  { trigger: 'Trigger 1', content: 'Content 1' },
  { trigger: 'Trigger 2', content: 'Content 2' },
  { trigger: 'Trigger 3', content: 'Content 3' },
]

export const renderAccordion = (options: RenderAccordionOptions = {}) => {
  const { type, items = defaultItems } = options
  const user = userEvent.setup()

  render(
    <Accordion.Root type={type}>
      {items.map((item, index) => (
        <Accordion.Item key={index}>
          <Accordion.Header as={item.header}>
            <Accordion.Trigger>{item.trigger}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <p>{item.content}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )

  const triggers = items.map((item) =>
    screen.getByRole('button', { name: item.trigger })
  )
  const contents = items.map((item) => screen.getByLabelText(item.trigger))

  return { user, triggers, contents }
}

describe('Accordion', () => {
  describe('Rendering', () => {
    it('content is closed by default', () => {
      const { contents } = renderAccordion()
      contents.forEach((item) => {
        expect(item).not.toBeVisible()
      })
    })
    it('correct aria attributes', () => {
      const { contents, triggers } = renderAccordion()
      contents.forEach((content, index) => {
        expect(content).toHaveAttribute(
          'aria-labelledby',
          `accordion-trigger-${index}`
        )
        expect(content).toHaveAttribute('id', `accordion-content-${index}`)
        expect(content).toHaveAttribute('role', 'region')
      })
      triggers.forEach((trigger, index) => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute(
          'aria-controls',
          `accordion-content-${index}`
        )
      })
    })
    it('renders header as h3 by default', () => {
      renderAccordion()

      const headers = screen.getAllByRole('heading')

      expect(headers).toHaveLength(defaultItems.length)
      headers.forEach((header) => {
        expect(header.tagName).toBe('H3')
      })
    })
    it('can render header as a different level', () => {
      const items = Array.from({ length: 6 }, (_, index) => ({
        trigger: `Trigger ${index + 1}`,
        content: `Content ${index + 1}`,
        header: `h${index + 1}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
      }))
      renderAccordion({ items })

      const headers = screen.getAllByRole('heading')

      expect(headers).toHaveLength(6)
      headers.forEach((header, index) => {
        expect(header.tagName).toBe(`H${index + 1}`)
      })
    })
  })

  describe('keyboard navigation', () => {
    describe('on ArrowUp', () => {
      it('focuses trigger before the focused trigger', async () => {
        const { user, triggers } = renderAccordion()

        triggers[2].focus()

        await user.keyboard('{ArrowUp}')
        expect(triggers[1]).toHaveFocus()

        await user.keyboard('{ArrowUp}')
        expect(triggers[0]).toHaveFocus()
      })

      it('focuses last trigger when focused trigger is first', async () => {
        const { user, triggers } = renderAccordion()

        triggers[0].focus()

        await user.keyboard('{ArrowUp}')
        expect(triggers[2]).toHaveFocus()
      })
    })

    describe('on ArrowDown', () => {
      it('cycles through triggers', async () => {
        const { user, triggers } = renderAccordion()

        triggers[0].focus()

        await user.keyboard('{ArrowDown}')
        expect(triggers[1]).toHaveFocus()

        await user.keyboard('{ArrowDown}')
        expect(triggers[2]).toHaveFocus()
      })

      it('focuses first trigger when focused trigger is last', async () => {
        const { user, triggers } = renderAccordion()

        triggers[2].focus()

        await user.keyboard('{ArrowDown}')
        expect(triggers[0]).toHaveFocus()
      })
    })

    describe('on Home', () => {
      it('focuses the first trigger', async () => {
        const { user, triggers } = renderAccordion()

        triggers[2].focus()

        await user.keyboard('{Home}')
        expect(triggers[0]).toHaveFocus()
      })
    })

    describe('on End', () => {
      it('focuses the last trigger', async () => {
        const { user, triggers } = renderAccordion()

        triggers[0].focus()

        await user.keyboard('{End}')
        expect(triggers[2]).toHaveFocus()
      })
    })
  })
  describe('Interaction', () => {
    it('toggles visibility when trigger is clicked', async () => {
      const { user, triggers, contents } = renderAccordion()

      const trigger = triggers[0]
      await user.click(trigger)

      const content = contents[0]
      expect(content).toBeVisible()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(trigger)

      expect(content).not.toBeVisible()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    const expectVisible = (el: HTMLElement) => expect(el).toBeVisible()
    const expectHidden = (el: HTMLElement) => expect(el).not.toBeVisible()

    it.each([
      {
        type: 'single' as const,
        assertVisibility: expectHidden,
        label: 'closes',
      },
      { type: undefined, assertVisibility: expectHidden, label: 'closes' },
      {
        type: 'multiple' as const,
        assertVisibility: expectVisible,
        label: 'doesnt close',
      },
    ])(
      'when type=$type clicking a trigger when another item is open $label the other item',
      async ({ type, assertVisibility }) => {
        const { user, triggers, contents } = renderAccordion({ type })

        const trigger1 = triggers[0]
        const content1 = contents[0]
        const trigger2 = triggers[1]

        await user.click(trigger1)
        await user.click(trigger2)

        assertVisibility(content1)
      }
    )
  })
})
