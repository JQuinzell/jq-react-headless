import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion/Accordion'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    type: 'single',
  },
  argTypes: {
    children: { control: false },
    type: {
      control: { type: 'radio' },
      options: ['single', 'multiple'],
      description: 'Whether the accordion allows one or multiple items open',
    },
    value: {
      control: false,
    },
    defaultValue: {
      control: false,
    },
    onChange: {
      action: 'onChange',
      description: 'Callback when accordion value changes',
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<Omit<React.ComponentProps<typeof Accordion>, 'children'>>

export const Primary: Story = {
  args: {},
  render: (args) => (
    <Accordion type={args.type}>
      <AccordionItem>
        <AccordionTrigger>
          <button>Trigger 1</button>
        </AccordionTrigger>
        <AccordionContent>Content 1</AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>
          <button>Trigger 2</button>
        </AccordionTrigger>
        <AccordionContent>Content 2</AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>
          <button>Trigger 3</button>
        </AccordionTrigger>
        <AccordionContent>Content 3</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
