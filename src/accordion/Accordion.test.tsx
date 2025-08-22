import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from '.'

describe('Accordion', () => {
  describe('Accordion.Root', () => {
    it('indexes all items', async () => {
      render(
        <Accordion.Root type='multiple'>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 1</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 2</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 3</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 3</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await user.click(screen.getByRole('button', { name: 'Trigger 2' }))
      await user.click(screen.getByRole('button', { name: 'Trigger 3' }))

      const items = screen.getAllByRole('region')

      expect(items).toHaveLength(3)
      items.forEach((item, index) => {
        expect(item).toHaveAttribute('id', `accordion-content-${index}`)
      })
    })
  })
  describe('Accordion.Content', () => {
    it('renders items as closed by default', () => {
      render(
        <Accordion.Root>
          <Accordion.Item>
            <Accordion.Trigger>Trigger</Accordion.Trigger>
            <Accordion.Content>
              <p>Content</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const content = screen.getByText('Content')
      expect(content).not.toBeVisible()
    })

    it('has correct aria attributes', () => {
      render(
        <Accordion.Root>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 1</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 2</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 3</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 3</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const contents = screen.getAllByRole('region', { hidden: true })
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
      render(
        <Accordion.Root>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 1</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 3</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 3</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const triggers = screen.getAllByRole('button')
      triggers.forEach((trigger, index) => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute(
          'aria-controls',
          `accordion-content-${index}`
        )
      })
    })
    it('toggles visibility when trigger is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Accordion.Root>
          <Accordion.Item>
            <Accordion.Trigger>Trigger</Accordion.Trigger>
            <Accordion.Content>
              <p>Content</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      await user.click(trigger)

      const content = screen.getByText('Content')
      expect(content).toBeVisible()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(trigger)

      expect(content).not.toBeVisible()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
    it('is controllable by keyboard', async () => {
      const user = userEvent.setup()

      render(
        <Accordion.Root>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 1</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 1</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 2</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 2</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Trigger>Trigger 3</Accordion.Trigger>
            <Accordion.Content>
              <p>Content 3</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

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
        const user = userEvent.setup()

        render(
          <Accordion.Root type={type}>
            <Accordion.Item>
              <Accordion.Trigger>Trigger 1</Accordion.Trigger>
              <Accordion.Content>
                <p>Content 1</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item>
              <Accordion.Trigger>Trigger 2</Accordion.Trigger>
              <Accordion.Content>
                <p>Content 2</p>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        )

        const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
        const content1 = screen.getByText('Content 1')
        const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

        await user.click(trigger1)
        await user.click(trigger2)

        assertVisibility(content1)
      }
    )
  })
})
