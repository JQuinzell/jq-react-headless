import { describe, it, beforeEach, afterEach, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Accordion } from '.'

describe('Accordion', () => {
  it('renders items as closed by default', () => {
    render(
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger><button>Trigger</button></Accordion.Trigger>
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
