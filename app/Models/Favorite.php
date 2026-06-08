<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = ['buyer_id', 'product_id'];

    public function buyer()   { return $this->belongsTo(Buyer::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
