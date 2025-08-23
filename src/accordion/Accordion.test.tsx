import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from '.'

type RenderAccordionOptions = {
  type?: 'single' | 'multiple'
  items?: { trigger: string; content: string }[]
}

const defaultItems = [
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
          <h3>
            <Accordion.Trigger>{item.trigger}</Accordion.Trigger>
          </h3>
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
  describe('Accordion.Root', () => {
    it('indexes all items', async () => {
      const { contents } = renderAccordion()
      expect(contents).toHaveLength(3)
      contents.forEach((item, index) => {
        expect(item).toHaveAttribute('id', `accordion-content-${index}`)
      })
    })
  })
  describe('Accordion.Content', () => {
    it('renders items as closed by default', () => {
      const { contents } = renderAccordion()

      const content = contents[0]
      expect(content).not.toBeVisible()
    })

    it('has correct aria attributes', () => {
      const { contents } = renderAccordion()
      contents.forEach((content, index) => {
        expect(content).toHaveAttribute(
          'aria-labelledby',
          `accordion-trigger-${index}`
        )
        expect(content).toHaveAttribute('id', `accordion-content-${index}`)
      })
    })
  })

  describe('Accordion.Trigger', () => {
    it('has correct aria attributes', () => {
      const { triggers } = renderAccordion()

      triggers.forEach((trigger, index) => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute(
          'aria-controls',
          `accordion-content-${index}`
        )
      })
    })

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
    it('is controllable by keyboard', async () => {
      const { user, triggers } = renderAccordion()

      const trigger1 = triggers[0]
      const trigger2 = triggers[1]
      const trigger3 = triggers[2]

      await user.tab()
      expect(trigger1).toHaveFocus()

      // Down logic
      await user.keyboard('{ArrowDown}')
      expect(trigger2).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(trigger3).toHaveFocus()

      // Up logic
      await user.keyboard('{ArrowUp}')
      expect(trigger2).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(trigger1).toHaveFocus()

      // End logic
      await user.keyboard('{End}')
      expect(trigger3).toHaveFocus()

      // Home logic
      await user.keyboard('{Home}')
      expect(trigger1).toHaveFocus()

      // Up wraps to end
      await user.keyboard('{ArrowUp}')
      expect(trigger3).toHaveFocus()

      // Down wraps to home
      await user.keyboard('{ArrowDown}')
      expect(trigger1).toHaveFocus()
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
