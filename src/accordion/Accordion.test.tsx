import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from '.'

describe('Accordion', () => {
  describe('Accordion.Root', () => {
    it('indexes all items',  async () => {
      render(<Accordion.Root type="multiple">
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
      </Accordion.Root>)

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await user.click(screen.getByRole('button', { name: 'Trigger 2' }))
      await user.click(screen.getByRole('button', { name: 'Trigger 3' }))

      const items = screen.getAllByRole('region')

      expect(items).toHaveLength(3)
      items.forEach((item, index) => {
        expect(item).toHaveAttribute('data-index', index.toString())
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
  })

  describe('Accordion.Trigger', () => {
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

      await user.click(trigger)

      expect(content).not.toBeVisible()
    })


    const expectVisible = (el: HTMLElement) => expect(el).toBeVisible()
    const expectHidden = (el: HTMLElement) => expect(el).not.toBeVisible()

    it.each([
      { 
        type: 'single' as const, assertVisibility: expectHidden, label: 'closes' },
      { type: undefined, assertVisibility: expectHidden, label: 'closes' },
      { type: 'multiple' as const, assertVisibility: expectVisible, label: 'doesnt close' },
    ])('when type=$type clicking a trigger when another item is open $label the other item', async ({ type, assertVisibility }) => {
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
    })
  })
})
