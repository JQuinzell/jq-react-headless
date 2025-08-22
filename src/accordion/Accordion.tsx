import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react'

type AccordionItemType = {
  id: string
  triggerRef: HTMLButtonElement
}

const AccordionContext = createContext<{
  currentOpenItems: string[]
  toggleOpenItem: (id: string) => void
  registerItem: (item: AccordionItemType) => void
  unregisterItem: (id: string) => void
  items: AccordionItemType[]
} | null>(null)

const AccordionItemContext = createContext<{
  id: string
  isOpen: boolean
  index: number
} | null>(null)

export const Accordion: FC<{
  children: ReactNode
  value?: string[]
  defaultValue?: string[]
  type?: 'single' | 'multiple'
  onChange?: (prev: string[], next: string[]) => void
}> = ({ children, value, defaultValue = [], type = 'single', onChange }) => {
  const [currentOpenItems, setCurrentOpenItems] =
    useState<string[]>(defaultValue)
  const [items, setItems] = useState<AccordionItemType[]>([])

  const openItems = value || currentOpenItems

  const toggleOpenItem = (id: string) => {
    let newOpenItems: string[]
    if (type === 'single') {
      newOpenItems = openItems.includes(id) ? [] : [id]
    } else {
      newOpenItems = openItems.includes(id)
        ? openItems.filter((item) => item !== id)
        : [...openItems, id]
    }
    if (value === undefined) {
      setCurrentOpenItems(newOpenItems)
    }
    onChange?.(openItems, newOpenItems)
  }

  const registerItem = (item: AccordionItemType) => {
    setItems((items) =>
      items.find((i) => i.id === item.id) ? items : [...items, item]
    )
  }

  const unregisterItem = (id: string) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  return (
    <AccordionContext.Provider
      value={{
        currentOpenItems: openItems,
        toggleOpenItem,
        registerItem,
        unregisterItem,
        items,
      }}
    >
      <div className='flex flex-col gap-2'>{children}</div>
    </AccordionContext.Provider>
  )
}

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider')
  }
  return context
}

export const AccordionItem: FC<{ children: ReactNode; id?: string }> = ({
  children,
  id: givenId = null,
}) => {
  const defaultId = useId()
  const id = givenId ?? defaultId
  const { currentOpenItems, items } = useAccordion()
  const isOpen = currentOpenItems.includes(id)
  const index = items.findIndex((item) => item.id === id)

  return (
    <AccordionItemContext.Provider value={{ id, isOpen, index }}>
      <div data-index={index} className='flex flex-col'>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error('useAccordionItem must be used within an AccordionItem')
  }
  return context
}

type AccordionTriggerProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export const AccordionTrigger: FC<AccordionTriggerProps> = ({
  children,
  onClick,
  disabled,
}) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { toggleOpenItem, items, registerItem, unregisterItem } = useAccordion()
  const { id, isOpen, index } = useAccordionItem()

  useEffect(() => {
    registerItem({ id, triggerRef: ref.current! })
    return () => unregisterItem(id)
  }, [id])

  return (
    <button
      ref={ref}
      id={`accordion-trigger-${index}`}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={() => {
        toggleOpenItem(id)
        onClick?.()
      }}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${index}`}
      onKeyDown={(e) => {
        if (disabled) return
        const focusTrigger = (index: number) => {
          const trigger = items[index].triggerRef
          trigger.focus()
        }
        const actions: Record<string, () => void | undefined> = {
          ArrowDown: () => focusTrigger((index + 1) % items.length),
          ArrowUp: () =>
            focusTrigger((index - 1 + items.length) % items.length),
          Home: () => focusTrigger(0),
          End: () => focusTrigger(items.length - 1),
        }
        const action = actions[e.key]
        if (action) {
          e.preventDefault()
          action()
        }
      }}
    >
      {children}
    </button>
  )
}

export const AccordionContent: FC<{ children: ReactNode; id?: string }> = ({
  children,
}) => {
  const { isOpen, index } = useAccordionItem()
  return (
    <section
      id={`accordion-content-${index}`}
      role='region'
      hidden={!isOpen}
      aria-labelledby={`accordion-trigger-${index}`}
    >
      {children}
    </section>
  )
}
