import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

describe('UI Components', () => {
  describe('Button Component', () => {
    it('renders button with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeTruthy()
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalled()
    })

    it('disables button when disabled prop is true', () => {
      render(<Button disabled={true}>Disabled Button</Button>)
      const button = screen.getByText('Disabled Button')
      expect(button.disabled).toBe(true)
    })

    it('submits form when type is submit', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault())
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )
      fireEvent.click(screen.getByText('Submit'))
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('Card Component', () => {
    it('renders card with children', () => {
      render(
        <Card>
          <CardContent>Test content</CardContent>
        </Card>
      )
      expect(screen.getByText('Test content')).toBeTruthy()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      )
      expect(container.querySelector('.custom-class')).toBeTruthy()
    })
  })
})
