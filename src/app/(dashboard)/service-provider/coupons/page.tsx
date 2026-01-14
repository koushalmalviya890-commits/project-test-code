'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Trash2, Plus, Calendar, Percent, IndianRupee } from 'lucide-react'
import { toast } from 'sonner'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    couponCode: '',
    discount: '',
    minimumValue: '',
    validFrom: '',
    validTo: '',
    usageLimit: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/service-provider/coupons')
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/service-provider/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount: parseFloat(formData.discount),
          minimumValue: parseFloat(formData.minimumValue),
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
        })
      })

      const data = await res.json()
      
      if (data.success) {
        toast.success('Coupon created successfully')
        fetchCoupons()
        setIsDialogOpen(false)
        setFormData({
          couponCode: '',
          discount: '',
          minimumValue: '',
          validFrom: '',
          validTo: '',
          usageLimit: ''
        })
      } else {
        toast.error(data.message || 'Failed to create coupon')
      }
    } catch (error) {
      toast.error('Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const res = await fetch(`/api/service-provider/coupons/${couponId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date()
  }

  const isUpcoming = (validFrom: string) => {
    return new Date(validFrom) > new Date()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotional coupons for your facilities
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No coupons created yet</p>
          <Button 
            variant="link" 
            onClick={() => setIsDialogOpen(true)}
            className="mt-2"
          >
            Create your first coupon
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon: any) => {
            const expired = isExpired(coupon.validTo)
            const upcoming = isUpcoming(coupon.validFrom)
            
            return (
              <div 
                key={coupon._id} 
                className={`border rounded-lg p-5 relative ${
                  expired ? 'opacity-60 bg-muted/30' : 'bg-card'
                }`}
              >
                {/* Status Badge */}
                {expired && (
                  <span className="absolute top-3 right-3 text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                    Expired
                  </span>
                )}
                {upcoming && !expired && (
                  <span className="absolute top-3 right-3 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Upcoming
                  </span>
                )}
                {!expired && !upcoming && (
                  <span className="absolute top-3 right-3 text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Active
                  </span>
                )}

                <div className="space-y-3">
                  {/* Coupon Code */}
                  <div className="bg-primary/10 border-2 border-dashed border-primary rounded p-3 text-center">
                    <p className="text-2xl font-bold text-primary tracking-wider">
                      {coupon.couponCode}
                    </p>
                  </div>

                  {/* Discount Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Discount</span>
                    </div>
                    <span className="font-bold text-lg">{coupon.discount}%</span>
                  </div>

                  {/* Minimum Value */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Min. Value</span>
                    </div>
                    <span className="font-semibold">₹{coupon.minimumValue}</span>
                  </div>

                  {/* Validity */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Valid Period</span>
                    </div>
                    <p className="text-xs">
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTo).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Usage Stats */}
                  {coupon.usageLimit && (
                    <div className="text-xs text-muted-foreground">
                      Used: {coupon.usedCount} / {coupon.usageLimit}
                    </div>
                  )}

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input
                value={formData.couponCode}
                onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                placeholder="e.g., SUMMER25"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a unique code (letters and numbers only)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount (%) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Minimum Value (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.minimumValue}
                  onChange={(e) => setFormData({...formData, minimumValue: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From *</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Valid To *</Label>
                <Input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                  min={formData.validFrom}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Usage Limit (Optional)</Label>
              <Input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum number of times this coupon can be used
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}